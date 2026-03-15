import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ComposerCanvasComponent } from './components/composer-canvas/composer-canvas.component';
import { ComposerPaletteComponent } from './components/composer-palette/composer-palette.component';
import { ComposerPropertiesComponent } from './components/composer-properties/composer-properties.component';
import { ComposerToolbarComponent } from './components/composer-toolbar/composer-toolbar.component';
import { COMPOSER_MOCK_MODEL } from './mock/composer.mock';
import { CanvasNode, DslExportModel, PaletteItem } from './models/composer.models';

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
  protected readonly modelName = 'Customer Operations Semantic Model';
  protected readonly composer = signal(COMPOSER_MOCK_MODEL);
  protected readonly selectedNode = computed(() => {
    const state = this.composer();
    return state.canvasNodes.find((node) => node.id === state.selectedNodeId) ?? null;
  });
  protected readonly dslPreview = computed(() => JSON.stringify(this.exportDsl(), null, 2));

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

  private exportDsl(): DslExportModel {
    const state = this.composer();

    return {
      application: {
        name: this.modelName,
        nodeCount: state.canvasNodes.length,
        connectionCount: state.connections.length
      },
      nodes: state.canvasNodes.map((node) => ({
        id: node.id,
        name: node.name,
        label: node.label,
        type: node.type,
        category: node.category,
        description: node.description,
        layout: {
          x: node.position.x,
          y: node.position.y,
          width: node.size.width,
          height: node.size.height
        },
        properties: Object.fromEntries(node.properties.map((property) => [property.key, property.value]))
      })),
      connections: state.connections.map((connection) => ({
        id: connection.id,
        from: connection.sourceNodeId,
        to: connection.targetNodeId,
        label: connection.label
      }))
    };
  }

  private computeNodeStatus(node: CanvasNode): CanvasNode['status'] {
    return node.name.trim() && node.label.trim() && node.description.trim() && node.type.trim()
      ? 'configured'
      : 'draft';
  }
}
