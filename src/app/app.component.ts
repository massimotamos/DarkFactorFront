import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ComposerCanvasComponent } from './components/composer-canvas/composer-canvas.component';
import { ComposerPaletteComponent } from './components/composer-palette/composer-palette.component';
import { ComposerPropertiesComponent } from './components/composer-properties/composer-properties.component';
import { ComposerToolbarComponent } from './components/composer-toolbar/composer-toolbar.component';
import { COMPOSER_MOCK_MODEL } from './mock/composer.mock';
import { CanvasNode, PaletteItem } from './models/composer.models';
import { SemanticProjectionResult } from './models/semantic-language.models';
import { SemanticProjectionService } from './services/semantic-projection.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
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
    JSON.stringify(this.semanticProjection().ast, null, 2)
  );
  protected readonly validationPreview = computed(() =>
    this.semanticProjection().validationIssues.length > 0
      ? this.semanticProjection().validationIssues
          .map((issue) => `[${issue.severity.toUpperCase()}] ${issue.code}: ${issue.message}`)
          .join('\n')
      : 'No semantic validation issues.'
  );

  constructor(private readonly semanticProjectionService: SemanticProjectionService) {}

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
    return node.name.trim() && node.label.trim() && node.description.trim() && node.type.trim()
      ? 'configured'
      : 'draft';
  }
}
