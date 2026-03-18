import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationReport, WorkflowModelRecord, WorkflowNodeSemanticRecord, WorkflowNodeVisualRecord } from '../../../../core/models/platform.models';

@Component({
  selector: 'app-workflow-canvas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workflow-canvas.component.html',
  styleUrl: './workflow-canvas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkflowCanvasComponent {
  @Input({ required: true }) workflowModel!: WorkflowModelRecord;
  @Input() selectedNodeId: string | null = null;
  @Input({ required: true }) validationReport!: ValidationReport;
  @Output() nodeSelected = new EventEmitter<string>();
  @Output() nodeMoved = new EventEmitter<{ nodeId: string; position: { x: number; y: number } }>();
  @Output() nodeConnected = new EventEmitter<{ sourceNodeId: string; targetNodeId: string }>();
  @Output() nodePropertyEdited = new EventEmitter<{ nodeId: string; patch: Partial<WorkflowNodeSemanticRecord> }>();
  @Output() nodeDeleted = new EventEmitter<string>();
  @Output() surfaceDropRequested = new EventEmitter<{ type: WorkflowNodeSemanticRecord['nodeType']; position: { x: number; y: number } }>();

  @ViewChild('surface', { static: true }) private surfaceRef!: ElementRef<HTMLDivElement>;

  protected pendingSourceNodeId: string | null = null;
  protected dropActive = false;

  private draggingNodeId: string | null = null;
  private dragOffset = { x: 0, y: 0 };

  protected trackNode(_: number, node: WorkflowNodeSemanticRecord): string {
    return node.id;
  }

  protected visual(nodeId: string): WorkflowNodeVisualRecord | undefined {
    return this.workflowModel.visualNodes.find((node) => node.nodeId === nodeId);
  }

  protected isDisconnected(nodeId: string): boolean {
    return this.validationReport.byCategory.structural.some((issue) => issue.code === 'WORKFLOW_NODE_DISCONNECTED' && issue.elementId === nodeId);
  }

  protected getConnectionPath(sourceNodeId: string, targetNodeId: string): string {
    const source = this.visual(sourceNodeId);
    const target = this.visual(targetNodeId);
    if (!source || !target) {
      return '';
    }

    const sourceX = source.position.x + source.size.width;
    const sourceY = source.position.y + source.size.height / 2;
    const targetX = target.position.x;
    const targetY = target.position.y + target.size.height / 2;
    const curve = Math.max(60, (targetX - sourceX) / 2);
    return `M ${sourceX} ${sourceY} C ${sourceX + curve} ${sourceY}, ${targetX - curve} ${targetY}, ${targetX} ${targetY}`;
  }

  protected connectionLabelPosition(sourceNodeId: string, targetNodeId: string): { x: number; y: number } {
    const source = this.visual(sourceNodeId);
    const target = this.visual(targetNodeId);
    if (!source || !target) {
      return { x: 0, y: 0 };
    }
    return {
      x: (source.position.x + source.size.width + target.position.x) / 2,
      y: (source.position.y + target.position.y) / 2 + 10
    };
  }

  protected onSurfaceDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dropActive = true;
  }

  protected onSurfaceDragLeave(event: DragEvent): void {
    if (event.currentTarget === event.target) {
      this.dropActive = false;
    }
  }

  protected onSurfaceDrop(event: DragEvent): void {
    event.preventDefault();
    this.dropActive = false;
    const payload = event.dataTransfer?.getData('application/x-node-template');
    if (!payload) {
      return;
    }

    const template = JSON.parse(payload) as { type: WorkflowNodeSemanticRecord['nodeType'] };
    const rect = this.surfaceRef.nativeElement.getBoundingClientRect();
    this.surfaceDropRequested.emit({
      type: template.type,
      position: {
        x: Math.max(24, event.clientX - rect.left - 90),
        y: Math.max(24, event.clientY - rect.top - 40)
      }
    });
  }

  protected onNodePointerDown(event: MouseEvent, node: WorkflowNodeSemanticRecord): void {
    event.stopPropagation();

    if (this.pendingSourceNodeId && this.pendingSourceNodeId !== node.id) {
      this.nodeConnected.emit({ sourceNodeId: this.pendingSourceNodeId, targetNodeId: node.id });
      this.pendingSourceNodeId = null;
      return;
    }

    const visual = this.visual(node.id);
    if (!visual) {
      return;
    }

    this.nodeSelected.emit(node.id);
    this.draggingNodeId = node.id;
    const rect = this.surfaceRef.nativeElement.getBoundingClientRect();
    this.dragOffset = {
      x: event.clientX - rect.left - visual.position.x,
      y: event.clientY - rect.top - visual.position.y
    };
  }

  protected startConnection(event: MouseEvent, nodeId: string): void {
    event.stopPropagation();
    this.pendingSourceNodeId = this.pendingSourceNodeId === nodeId ? null : nodeId;
  }

  protected deleteNode(event: MouseEvent, nodeId: string): void {
    event.stopPropagation();
    this.nodeDeleted.emit(nodeId);
  }

  protected onCanvasPointerDown(): void {
    this.draggingNodeId = null;
    this.pendingSourceNodeId = null;
  }

  @HostListener('window:mousemove', ['$event'])
  protected onWindowMouseMove(event: MouseEvent): void {
    if (!this.draggingNodeId) {
      return;
    }

    const node = this.visual(this.draggingNodeId);
    if (!node) {
      return;
    }

    const rect = this.surfaceRef.nativeElement.getBoundingClientRect();
    this.nodeMoved.emit({
      nodeId: node.nodeId,
      position: {
        x: Math.min(Math.max(24, event.clientX - rect.left - this.dragOffset.x), Math.max(24, rect.width - node.size.width - 24)),
        y: Math.min(Math.max(24, event.clientY - rect.top - this.dragOffset.y), Math.max(24, rect.height - node.size.height - 24))
      }
    });
  }

  @HostListener('window:mouseup')
  protected onWindowMouseUp(): void {
    this.draggingNodeId = null;
  }
}
