import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ActorRecord,
  BusinessRuleRecord,
  CapabilityRecord,
  DomainEntityRecord,
  EpicRecord,
  ServiceCandidateRecord,
  UserStoryRecord,
  WorkflowNodeSemanticRecord,
  WorkflowNodeVisualRecord
} from '../../../../core/models/platform.models';

@Component({
  selector: 'app-property-inspector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-inspector.component.html',
  styleUrl: './property-inspector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropertyInspectorComponent {
  @Input() selectedNode: WorkflowNodeSemanticRecord | null = null;
  @Input() selectedNodeVisual: WorkflowNodeVisualRecord | null = null;
  @Input() epics: EpicRecord[] = [];
  @Input() stories: UserStoryRecord[] = [];
  @Input() actors: ActorRecord[] = [];
  @Input() capabilities: CapabilityRecord[] = [];
  @Input() serviceCandidates: ServiceCandidateRecord[] = [];
  @Input() domainEntities: DomainEntityRecord[] = [];
  @Input() businessRules: BusinessRuleRecord[] = [];
  @Output() nodeUpdated = new EventEmitter<{
    nodeId: string;
    semanticPatch?: Partial<WorkflowNodeSemanticRecord>;
    visualPatch?: Partial<WorkflowNodeVisualRecord>;
  }>();

  protected updateSemantic(field: keyof WorkflowNodeSemanticRecord, value: string): void {
    if (!this.selectedNode) {
      return;
    }
    this.nodeUpdated.emit({
      nodeId: this.selectedNode.id,
      semanticPatch: { [field]: value === '' ? null : value } as Partial<WorkflowNodeSemanticRecord>
    });
  }

  protected updateVisual(field: 'x' | 'y' | 'width' | 'height', value: string): void {
    if (!this.selectedNodeVisual || Number.isNaN(Number(value))) {
      return;
    }
    const numeric = Number(value);
    this.nodeUpdated.emit({
      nodeId: this.selectedNodeVisual.semanticNodeId,
      visualPatch: field === 'x' || field === 'y'
        ? { position: { ...this.selectedNodeVisual.position, [field]: numeric } }
        : { size: { ...this.selectedNodeVisual.size, [field]: numeric } }
    });
  }
}
