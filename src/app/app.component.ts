import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, computed, signal } from '@angular/core';
import { ComposerCanvasComponent } from './components/composer-canvas/composer-canvas.component';
import { ComposerPaletteComponent } from './components/composer-palette/composer-palette.component';
import { ComposerPropertiesComponent } from './components/composer-properties/composer-properties.component';
import { ComposerToolbarComponent } from './components/composer-toolbar/composer-toolbar.component';
import { COMPOSER_MOCK_MODEL } from './mock/composer.mock';
import { CanvasNode, PaletteItem } from './models/composer.models';
import { SemanticProjectionResult } from './models/semantic-language.models';
import { SemanticDslRendererService } from './services/semantic-dsl-renderer.service';
import { NodeValidationService } from './services/node-validation.service';
import { SemanticProjectionService } from './services/semantic-projection.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ComposerToolbarComponent,
    ComposerPaletteComponent,
    ComposerCanvasComponent,
    ComposerPropertiesComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  protected readonly modelName = 'Commerce Demo Semantic Model';
  protected readonly composer = signal(COMPOSER_MOCK_MODEL);
  protected readonly isDslPreviewOpen = signal(false);
  protected readonly paletteWidth = signal(272);
  protected readonly propertiesWidth = signal(288);
  protected readonly semanticProjection = computed<SemanticProjectionResult>(() =>
    this.semanticProjectionService.project(
      this.modelName,
      this.composer().canvasNodes,
      this.composer().connections
    )
  );
  protected readonly selectedNode = computed(() => {
    const state = this.composer();
    return state.canvasNodes.find((node) => node.id === state.selectedNodeId) ?? null;
  });
  protected readonly semanticPreview = computed(() =>
    this.semanticDslRendererService.render(this.semanticProjection().ast)
  );
  protected readonly validationPreview = computed(() =>
    this.semanticProjection().validationIssues.length > 0
      ? this.semanticProjection().validationIssues
          .map((issue) => `[${issue.severity.toUpperCase()}] ${issue.code}: ${issue.message}`)
          .join('\n')
      : 'No semantic validation issues.'
  );
  protected readonly workspaceColumns = computed(
    () => `${this.paletteWidth()}px 10px minmax(0, 1fr) 10px ${this.propertiesWidth()}px`
  );

  private resizingPane: 'palette' | 'properties' | null = null;

  constructor(
    private readonly semanticDslRendererService: SemanticDslRendererService,
    private readonly nodeValidationService: NodeValidationService,
    private readonly semanticProjectionService: SemanticProjectionService
  ) {}

  protected onNodeSelected(nodeId: string): void {
    this.composer.update((state) => ({
      ...state,
      selectedNodeId: nodeId
    }));
  }

  protected onNodeDropped(event: { item: PaletteItem; position: { x: number; y: number } }): void {
    const newNode = this.createNodeFromPaletteItem(event.item, event.position);

    this.composer.update((state) => ({
      ...state,
      selectedNodeId: newNode.id,
      canvasNodes: [...state.canvasNodes, newNode],
      connections: state.selectedNodeId
        ? [
            ...state.connections,
            {
              id: `conn-${state.selectedNodeId}-${newNode.id}`,
              sourceNodeId: state.selectedNodeId,
              targetNodeId: newNode.id,
              label: 'next'
            }
          ]
        : state.connections
    }));
  }

  protected onNodeMoved(event: { nodeId: string; position: { x: number; y: number } }): void {
    this.composer.update((state) => ({
      ...state,
      canvasNodes: state.canvasNodes.map((node) =>
        node.id === event.nodeId
          ? {
              ...node,
              position: event.position
            }
          : node
      )
    }));
  }

  protected onBasicPropertyChanged(event: {
    nodeId: string;
    field: 'name' | 'label' | 'description' | 'type';
    value: string;
  }): void {
    this.composer.update((state) => ({
      ...state,
      canvasNodes: state.canvasNodes.map((node) =>
        node.id === event.nodeId
          ? {
              ...node,
              [event.field]: event.value,
              status: this.computeNodeStatus({
                ...node,
                [event.field]: event.value
              })
            }
          : node
      )
    }));
  }

  protected onPromptChanged(event: { nodeId: string; value: string }): void {
    this.composer.update((state) => ({
      ...state,
      canvasNodes: state.canvasNodes.map((node) =>
        node.id === event.nodeId
          ? {
              ...node,
              prompt: event.value,
              validationState: 'unvalidated',
              status: this.computeNodeStatus({
                ...node,
                prompt: event.value,
                validationState: 'unvalidated'
              })
            }
          : node
      )
    }));
  }

  protected onValidateRequested(nodeId: string): void {
    this.composer.update((state) => ({
      ...state,
      canvasNodes: state.canvasNodes.map((node) => {
        if (node.id !== nodeId) {
          return node;
        }

        const hasPrompt = node.prompt.trim().length > 0;
        const validatedSemanticCode = hasPrompt
          ? this.nodeValidationService.generateSemanticCode(node)
          : '';
        const validationState = hasPrompt ? 'validated' : 'invalid';

        return {
          ...node,
          validatedSemanticCode,
          validationState,
          status: validationState === 'validated' ? 'configured' : 'warning'
        };
      })
    }));
  }

  protected openDslPreview(): void {
    this.isDslPreviewOpen.set(true);
  }

  protected closeDslPreview(): void {
    this.isDslPreviewOpen.set(false);
  }

  protected startResize(pane: 'palette' | 'properties', event: MouseEvent): void {
    event.preventDefault();
    this.resizingPane = pane;
  }

  @HostListener('window:mousemove', ['$event'])
  protected onWindowMouseMove(event: MouseEvent): void {
    if (!this.resizingPane || window.innerWidth <= 1100) {
      return;
    }

    const minPaneWidth = 220;
    const maxPaneWidth = 420;
    const viewportWidth = window.innerWidth;

    if (this.resizingPane === 'palette') {
      const nextWidth = Math.min(Math.max(minPaneWidth, event.clientX), maxPaneWidth);
      this.paletteWidth.set(nextWidth);
      return;
    }

    const nextWidth = Math.min(Math.max(minPaneWidth, viewportWidth - event.clientX), maxPaneWidth);
    this.propertiesWidth.set(nextWidth);
  }

  @HostListener('window:mouseup')
  protected onWindowMouseUp(): void {
    this.resizingPane = null;
  }

  @HostListener('window:keydown.escape')
  protected onEscapeKey(): void {
    this.closeDslPreview();
  }

  private createNodeFromPaletteItem(item: PaletteItem, position: { x: number; y: number }): CanvasNode {
    const baseName = item.label.replace(/[^a-zA-Z0-9]+/g, ' ').trim();
    const normalizedName = baseName
      ? baseName.charAt(0).toLowerCase() + baseName.slice(1).replace(/\s+(\w)/g, (_, char: string) => char.toUpperCase()).replace(/\s+/g, '')
      : 'node';

    return {
      id: `node-${item.id}-${Date.now()}`,
      type: item.type,
      category: item.category,
      name: normalizedName,
      label: item.label,
      description: item.description,
      prompt: '',
      validatedSemanticCode: '',
      validationState: 'unvalidated',
      position,
      size: { width: 220, height: 110 },
      status: 'draft',
      properties: [
        { key: 'name', label: 'Name', value: normalizedName, group: 'general' },
        { key: 'description', label: 'Description', value: item.description, group: 'general' }
      ]
    };
  }

  private computeNodeStatus(node: CanvasNode): CanvasNode['status'] {
    if (!node.name.trim() || !node.label.trim() || !node.description.trim() || !node.type.trim()) {
      return 'draft';
    }

    if (node.validationState === 'invalid') {
      return 'warning';
    }

    return node.validationState === 'validated' ? 'configured' : 'draft';
  }
}
