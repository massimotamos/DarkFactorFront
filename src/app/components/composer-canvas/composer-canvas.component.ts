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
  @Input({ required: true }) selectedNodeId: string | null = null;
  @Output() nodeSelected = new EventEmitter<string>();
  @Output() nodeDropped = new EventEmitter<{ item: PaletteItem; position: { x: number; y: number } }>();
  @Output() nodeMoved = new EventEmitter<{ nodeId: string; position: { x: number; y: number } }>();

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
