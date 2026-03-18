import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ArchitectureDecisionPanelComponent } from './features/architecture-decision/components/architecture-decision-panel/architecture-decision-panel.component';
import { BacklogPanelComponent } from './features/backlog-management/components/backlog-panel/backlog-panel.component';
import { WorkflowCanvasComponent } from './features/canvas-modeler/components/workflow-canvas/workflow-canvas.component';
import { NodePaletteComponent } from './features/canvas-modeler/components/node-palette/node-palette.component';
import { CapabilityServicePanelComponent } from './features/capability-design/components/capability-service-panel/capability-service-panel.component';
import { DerivationPanelComponent } from './features/derivation/components/derivation-panel/derivation-panel.component';
import { DomainPanelComponent } from './features/domain-model/components/domain-panel/domain-panel.component';
import { DslPanelComponent } from './features/dsl-visualization/components/dsl-panel/dsl-panel.component';
import { InitiativePanelComponent } from './features/initiative-management/components/initiative-panel/initiative-panel.component';
import { PropertyInspectorComponent } from './features/property-inspector/components/property-inspector/property-inspector.component';
import { TraceabilityPanelComponent } from './features/traceability/components/traceability-panel/traceability-panel.component';
import { ValidationSummaryPanelComponent } from './features/validation/components/validation-summary-panel/validation-summary-panel.component';
import { PlatformWorkspaceService } from './core/state/platform-workspace.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    InitiativePanelComponent,
    BacklogPanelComponent,
    DomainPanelComponent,
    CapabilityServicePanelComponent,
    ArchitectureDecisionPanelComponent,
    NodePaletteComponent,
    WorkflowCanvasComponent,
    PropertyInspectorComponent,
    DerivationPanelComponent,
    DslPanelComponent,
    TraceabilityPanelComponent,
    ValidationSummaryPanelComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  protected readonly workspace = inject(PlatformWorkspaceService);
  protected readonly issueCount = computed(() => this.workspace.validationReport().issues.length);
}
