import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasConnection, CanvasNode, PaletteItem } from '../../models/composer.models';

@Component({
  selector: 'app-composer-canvas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './composer-canvas.component.html',
  styleUrl: './composer-canvas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComposerCanvasComponent {
  @Input({ required: true }) nodes: CanvasNode[] = [];
  @Input({ required: true }) connections: CanvasConnection[] = [];
  @Input() invalidConnectionIds: string[] = [];
  @Input({ required: true }) selectedNodeId: string | null = null;
  @Input() pendingConnectionSourceId: string | null = null;
  @Input() validConnectionTargetIds: string[] = [];
  @Output() nodeSelected = new EventEmitter<string>();
  @Output() nodeDropped = new EventEmitter<{ item: PaletteItem; position: { x: number; y: number } }>();
  @Output() nodeMoved = new EventEmitter<{ nodeId: string; position: { x: number; y: number } }>();
  @Output() connectionStarted = new EventEmitter<string>();
  @Output() connectionCompleted = new EventEmitter<string>();
  @Output() connectionCanceled = new EventEmitter<void>();

  @ViewChild('surface', { static: true }) private surfaceRef!: ElementRef<HTMLDivElement>;

  protected isDropTargetActive = false;

  private draggingNodeId: string | null = null;
  private dragOffset = { x: 0, y: 0 };

  trackByNodeId(_: number, node: CanvasNode): string {
    return node.id;
  }

  trackByConnectionId(_: number, connection: CanvasConnection): string {
    return connection.id;
  }

  isConnectionInvalid(connectionId: string): boolean {
    return this.invalidConnectionIds.includes(connectionId);
  }

  isConnectionSource(nodeId: string): boolean {
    return this.pendingConnectionSourceId === nodeId;
  }

  isConnectionTarget(nodeId: string): boolean {
    return this.validConnectionTargetIds.includes(nodeId);
  }

  nodeTypeClass(node: CanvasNode): string {
    return `canvas-node--${node.type}`;
  }

  connectionGradientId(connection: CanvasConnection): string {
    return `connection-gradient-${connection.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  }

  connectionGradientVector(connection: CanvasConnection): { x1: number; y1: number; x2: number; y2: number } {
    const sourceNode = this.nodes.find((node) => node.id === connection.sourceNodeId);
    const targetNode = this.nodes.find((node) => node.id === connection.targetNodeId);

    if (!sourceNode || !targetNode) {
      return { x1: 0, y1: 0, x2: 1, y2: 0 };
    }

    return {
      x1: sourceNode.position.x + sourceNode.size.width,
      y1: sourceNode.position.y + sourceNode.size.height / 2,
      x2: targetNode.position.x,
      y2: targetNode.position.y + targetNode.size.height / 2
    };
  }

  connectionStroke(connection: CanvasConnection): string {
    return this.isConnectionInvalid(connection.id)
      ? 'rgba(248, 113, 113, 0.9)'
      : `url(#${this.connectionGradientId(connection)})`;
  }

  connectionLabelColor(connection: CanvasConnection): string {
    if (this.isConnectionInvalid(connection.id)) {
      return '#fda4af';
    }

    const sourceNode = this.nodes.find((node) => node.id === connection.sourceNodeId);
    return sourceNode ? this.nodeAccent(sourceNode) : '#bae6fd';
  }

  nodeAccent(node: CanvasNode): string {
    switch (node.type) {
      case 'applicationContext':
        return '#f59e0b';
      case 'role':
        return '#e879f9';
      case 'entity':
        return '#14b8a6';
      case 'view':
        return '#38bdf8';
      case 'task':
        return '#22c55e';
      case 'rule':
        return '#f97316';
      default:
        return '#a78bfa';
    }
  }

  connectionGradientStops(connection: CanvasConnection): { start: string; end: string } {
    const sourceNode = this.nodes.find((node) => node.id === connection.sourceNodeId);
    const targetNode = this.nodes.find((node) => node.id === connection.targetNodeId);

    return {
      start: sourceNode ? this.nodeAccent(sourceNode) : '#7dd3fc',
      end: targetNode ? this.nodeAccent(targetNode) : '#c4b5fd'
    };
  }

  getConnectionPath(connection: CanvasConnection): string {
    const sourceNode = this.nodes.find((node) => node.id === connection.sourceNodeId);
    const targetNode = this.nodes.find((node) => node.id === connection.targetNodeId);

    if (!sourceNode || !targetNode) {
      return '';
    }

    const sourceX = sourceNode.position.x + sourceNode.size.width;
    const sourceY = sourceNode.position.y + sourceNode.size.height / 2;
    const targetX = targetNode.position.x;
    const targetY = targetNode.position.y + targetNode.size.height / 2;
    const curveOffset = Math.max(56, (targetX - sourceX) / 2);

    return `M ${sourceX} ${sourceY} C ${sourceX + curveOffset} ${sourceY}, ${targetX - curveOffset} ${targetY}, ${targetX} ${targetY}`;
  }

  getConnectionLabelPosition(connection: CanvasConnection): { x: number; y: number } {
    const sourceNode = this.nodes.find((node) => node.id === connection.sourceNodeId);
    const targetNode = this.nodes.find((node) => node.id === connection.targetNodeId);

    if (!sourceNode || !targetNode) {
      return { x: 0, y: 0 };
    }

    return {
      x: (sourceNode.position.x + sourceNode.size.width + targetNode.position.x) / 2,
      y: (sourceNode.position.y + sourceNode.size.height / 2 + targetNode.position.y + targetNode.size.height / 2) / 2 - 12
    };
  }

  onSurfaceDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
    this.isDropTargetActive = true;
  }

  onSurfaceDragLeave(event: DragEvent): void {
    if (event.currentTarget === event.target) {
      this.isDropTargetActive = false;
    }
  }

  onSurfaceDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDropTargetActive = false;

    const payload = event.dataTransfer?.getData('application/x-composer-palette-item');
    if (!payload) {
      return;
    }

    const item = JSON.parse(payload) as PaletteItem;
    const surfaceRect = this.surfaceRef.nativeElement.getBoundingClientRect();
    const width = 220;
    const height = 110;

    this.nodeDropped.emit({
      item,
      position: {
        x: Math.max(24, event.clientX - surfaceRect.left - width / 2),
        y: Math.max(24, event.clientY - surfaceRect.top - height / 2)
      }
    });
  }

  onNodePointerDown(event: MouseEvent, node: CanvasNode): void {
    event.stopPropagation();

     if (this.pendingConnectionSourceId) {
      if (node.id !== this.pendingConnectionSourceId && this.isConnectionTarget(node.id)) {
        this.connectionCompleted.emit(node.id);
      }
      return;
    }

    this.nodeSelected.emit(node.id);
    this.draggingNodeId = node.id;
    const surfaceRect = this.surfaceRef.nativeElement.getBoundingClientRect();
    this.dragOffset = {
      x: event.clientX - surfaceRect.left - node.position.x,
      y: event.clientY - surfaceRect.top - node.position.y
    };
  }

  onCanvasBackgroundPointerDown(): void {
    this.draggingNodeId = null;
    if (this.pendingConnectionSourceId) {
      this.connectionCanceled.emit();
    }
  }

  onConnectionHandleClick(event: MouseEvent, nodeId: string): void {
    event.stopPropagation();
    if (this.pendingConnectionSourceId === nodeId) {
      this.connectionCanceled.emit();
      return;
    }

    this.nodeSelected.emit(nodeId);
    this.connectionStarted.emit(nodeId);
  }

  @HostListener('window:mousemove', ['$event'])
  onWindowMouseMove(event: MouseEvent): void {
    if (!this.draggingNodeId) {
      return;
    }

    const surfaceRect = this.surfaceRef.nativeElement.getBoundingClientRect();
    const node = this.nodes.find((candidate) => candidate.id === this.draggingNodeId);
    if (!node) {
      return;
    }

    const maxX = Math.max(24, surfaceRect.width - node.size.width - 24);
    const maxY = Math.max(24, surfaceRect.height - node.size.height - 24);

    this.nodeMoved.emit({
      nodeId: this.draggingNodeId,
      position: {
        x: Math.min(Math.max(24, event.clientX - surfaceRect.left - this.dragOffset.x), maxX),
        y: Math.min(Math.max(24, event.clientY - surfaceRect.top - this.dragOffset.y), maxY)
      }
    });
  }

  @HostListener('window:mouseup')
  onWindowMouseUp(): void {
    this.draggingNodeId = null;
  }
}
