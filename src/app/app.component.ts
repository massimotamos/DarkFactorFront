import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { BacklogPanelComponent } from './features/backlog-management/components/backlog-panel/backlog-panel.component';
import { WorkflowCanvasComponent } from './features/canvas-modeler/components/workflow-canvas/workflow-canvas.component';
import { NodePaletteComponent } from './features/canvas-modeler/components/node-palette/node-palette.component';
import { DslPanelComponent } from './features/dsl-visualization/components/dsl-panel/dsl-panel.component';
import { InitiativePanelComponent } from './features/initiative-management/components/initiative-panel/initiative-panel.component';
import { PropertyInspectorComponent } from './features/property-inspector/components/property-inspector/property-inspector.component';
import { TraceabilityPanelComponent } from './features/traceability/components/traceability-panel/traceability-panel.component';
import { PlatformWorkspaceService } from './core/state/platform-workspace.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    InitiativePanelComponent,
    BacklogPanelComponent,
    NodePaletteComponent,
    WorkflowCanvasComponent,
    PropertyInspectorComponent,
    DslPanelComponent,
    TraceabilityPanelComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  protected readonly workspace = inject(PlatformWorkspaceService);
  protected readonly issueCount = computed(() => this.workspace.validationReport().issues.length);
}
