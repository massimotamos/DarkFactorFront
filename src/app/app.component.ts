import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, ViewChild, computed, signal } from '@angular/core';
import { ComposerCanvasComponent } from './components/composer-canvas/composer-canvas.component';
import { ComposerPaletteComponent } from './components/composer-palette/composer-palette.component';
import { ComposerPropertiesComponent } from './components/composer-properties/composer-properties.component';
import { ComposerToolbarComponent } from './components/composer-toolbar/composer-toolbar.component';
import { COMPOSER_MOCK_MODEL } from './mock/composer.mock';
import { CanvasConnection, CanvasNode, PaletteItem } from './models/composer.models';
import { SemanticProjectionResult } from './models/semantic-language.models';
import { ComposerProjectFileService } from './services/composer-project-file.service';
import { ApplicationContextDraftService } from './services/application-context-draft.service';
import { SemanticDslRendererService } from './services/semantic-dsl-renderer.service';
import { SemanticLinkRulesService } from './services/semantic-link-rules.service';
import { NodeValidationService } from './services/node-validation.service';
import { ProjectValidationService } from './services/project-validation.service';
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
  @ViewChild('projectFileInput') private projectFileInput?: ElementRef<HTMLInputElement>;

  protected readonly modelName = signal('Ecommerce Reference Semantic Model');
  protected readonly composer = signal(COMPOSER_MOCK_MODEL);
  protected readonly isDslPreviewOpen = signal(false);
  protected readonly isProjectValidationOpen = signal(false);
  protected readonly pendingConnectionSourceId = signal<string | null>(null);
  protected readonly paletteWidth = signal(272);
  protected readonly propertiesWidth = signal(288);
  protected readonly semanticProjection = computed<SemanticProjectionResult>(() =>
    this.semanticProjectionService.project(
      this.modelName(),
      this.composer().canvasNodes,
      this.composer().connections
    )
  );
  protected readonly selectedNode = computed(() => {
    const state = this.composer();
    return state.canvasNodes.find((node) => node.id === state.selectedNodeId) ?? null;
  });
  protected readonly validConnectionTargetIds = computed(() => {
    const sourceId = this.pendingConnectionSourceId();
    if (!sourceId) {
      return [];
    }

    const state = this.composer();
    const sourceNode = state.canvasNodes.find((node) => node.id === sourceId);
    if (!sourceNode) {
      return [];
    }

    return state.canvasNodes
      .filter((node) =>
        node.id !== sourceId &&
        this.semanticLinkRulesService.isAllowed(sourceNode.type, node.type) &&
        !state.connections.some((connection) => connection.sourceNodeId === sourceId && connection.targetNodeId === node.id)
      )
      .map((node) => node.id);
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
  protected readonly invalidConnectionIds = computed(() =>
    this.semanticProjection().validationIssues
      .filter((issue) => issue.code === 'LINK_TYPE_NOT_ALLOWED' || issue.code === 'LINK_NODE_MISSING')
      .map((issue) => issue.elementId)
      .filter((elementId): elementId is string => !!elementId)
  );
  protected readonly projectValidation = computed(() =>
    this.projectValidationService.validate(
      this.semanticProjection().ast,
      this.semanticProjection().validationIssues
    )
  );
  protected readonly projectValidationSummary = computed(() => {
    const result = this.projectValidation();
    return [
      `Status: ${result.status.toUpperCase()}`,
      `Syntax issues: ${result.syntaxIssues.length}`,
      `Semantic issues: ${result.semanticIssues.length}`,
      `Generation issues: ${result.generationIssues.length}`
    ].join('\n');
  });
  protected readonly projectValidationDetails = computed(() => {
    const result = this.projectValidation();
    return [
      'Syntax',
      result.syntaxIssues.length > 0 ? this.formatIssues(result.syntaxIssues) : 'No syntax issues.',
      '',
      'Semantics',
      result.semanticIssues.length > 0 ? this.formatIssues(result.semanticIssues) : 'No semantic issues.',
      '',
      'Generation',
      result.generationIssues.length > 0 ? this.formatIssues(result.generationIssues) : 'No generation issues.'
    ].join('\n');
  });
  protected readonly workspaceColumns = computed(
    () => `${this.paletteWidth()}px 10px minmax(0, 1fr) 10px ${this.propertiesWidth()}px`
  );

  private resizingPane: 'palette' | 'properties' | null = null;

  constructor(
    private readonly semanticDslRendererService: SemanticDslRendererService,
    private readonly semanticLinkRulesService: SemanticLinkRulesService,
    private readonly nodeValidationService: NodeValidationService,
    private readonly composerProjectFileService: ComposerProjectFileService,
    private readonly applicationContextDraftService: ApplicationContextDraftService,
    private readonly projectValidationService: ProjectValidationService,
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
      connections: this.createAutoConnection(state.selectedNodeId, state.canvasNodes, newNode, state.connections)
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

  protected onConnectionStarted(nodeId: string): void {
    this.pendingConnectionSourceId.set(nodeId);
  }

  protected onConnectionCompleted(targetNodeId: string): void {
    const sourceNodeId = this.pendingConnectionSourceId();
    if (!sourceNodeId || sourceNodeId === targetNodeId) {
      this.pendingConnectionSourceId.set(null);
      return;
    }

    this.composer.update((state) => {
      const sourceNode = state.canvasNodes.find((node) => node.id === sourceNodeId);
      const targetNode = state.canvasNodes.find((node) => node.id === targetNodeId);
      if (!sourceNode || !targetNode) {
        return state;
      }

      if (!this.semanticLinkRulesService.isAllowed(sourceNode.type, targetNode.type)) {
        return state;
      }

      if (state.connections.some((connection) => connection.sourceNodeId === sourceNodeId && connection.targetNodeId === targetNodeId)) {
        return state;
      }

      return {
        ...state,
        connections: [
          ...state.connections,
          {
            id: `conn-${sourceNodeId}-${targetNodeId}-${Date.now()}`,
            sourceNodeId,
            targetNodeId,
            label: this.semanticLinkRulesService.defaultRelation(sourceNode.type, targetNode.type) ?? undefined
          }
        ]
      };
    });

    this.pendingConnectionSourceId.set(null);
  }

  protected onConnectionCanceled(): void {
    this.pendingConnectionSourceId.set(null);
  }

  protected onBasicPropertyChanged(event: {
    nodeId: string;
    field: 'name' | 'label' | 'description' | 'type';
    value: string;
  }): void {
    this.composer.update((state) => ({
      ...state,
      canvasNodes: state.canvasNodes.map((node) => {
        if (node.id !== event.nodeId) {
          return node;
        }

        const nextNode = {
          ...node,
          [event.field]: event.value
        };

        // Keep semantic keys predictable until the user explicitly diverges from the default.
        if (event.field === 'name') {
          const previousDefaultKey = this.nodeValidationService.defaultKey(node.type, node.name);
          if (node.semanticKey === previousDefaultKey) {
            nextNode.semanticKey = this.nodeValidationService.defaultKey(node.type, event.value);
          }
        }

        return {
          ...nextNode,
          status: this.computeNodeStatus(nextNode)
        };
      })
    }));
  }

  protected onSemanticFieldChanged(event: {
    nodeId: string;
    field: 'semanticKey' | 'semanticKind';
    value: string;
  }): void {
    this.composer.update((state) => ({
      ...state,
      canvasNodes: state.canvasNodes.map((node) =>
        node.id === event.nodeId
          ? {
              ...node,
              [event.field]: event.value || (event.field === 'semanticKind' ? null : ''),
              validationState: 'unvalidated',
              status: this.computeNodeStatus({
                ...node,
                [event.field]: event.value || (event.field === 'semanticKind' ? null : ''),
                validationState: 'unvalidated'
              })
            }
          : node
      )
    }));
  }

  protected onContextBriefChanged(event: {
    nodeId: string;
    field: 'context' | 'objective' | 'constraints' | 'safetyConcerns';
    value: string;
  }): void {
    this.composer.update((state) => ({
      ...state,
      canvasNodes: state.canvasNodes.map((node) =>
        node.id === event.nodeId
          ? {
              ...node,
              contextBrief: {
                context: node.contextBrief?.context ?? '',
                objective: node.contextBrief?.objective ?? '',
                constraints: node.contextBrief?.constraints ?? '',
                safetyConcerns: node.contextBrief?.safetyConcerns ?? '',
                [event.field]: event.value
              },
              validationState: 'unvalidated',
              status: this.computeNodeStatus({
                ...node,
                contextBrief: {
                  context: node.contextBrief?.context ?? '',
                  objective: node.contextBrief?.objective ?? '',
                  constraints: node.contextBrief?.constraints ?? '',
                  safetyConcerns: node.contextBrief?.safetyConcerns ?? '',
                  [event.field]: event.value
                },
                validationState: 'unvalidated'
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
        const hasKey = node.semanticKey.trim().length > 0;
        const hasRequiredKind = node.type === 'task' || node.type === 'rule' || node.type === 'integration';
        const hasKind = !hasRequiredKind || !!node.semanticKind?.trim();
        const hasContextBrief = node.type !== 'applicationContext'
          || (!!node.contextBrief?.context.trim() && !!node.contextBrief?.objective.trim());
        const validatedSemanticCode = hasPrompt
          && hasKey
          && hasKind
          && hasContextBrief
          ? this.nodeValidationService.generateSemanticCode(node)
          : '';
        const validationState = hasPrompt && hasKey && hasKind && hasContextBrief ? 'validated' : 'invalid';

        return {
          ...node,
          validatedSemanticCode,
          validationState,
          status: validationState === 'validated' ? 'configured' : 'warning'
        };
      })
    }));
  }

  protected onGenerateWorkflowRequested(nodeId: string): void {
    const contextNode = this.composer().canvasNodes.find((node) => node.id === nodeId && node.type === 'applicationContext');
    if (!contextNode) {
      return;
    }

    const draft = this.applicationContextDraftService.generate(contextNode);
    const draftedNodes = draft.nodes.map((node) => ({
      ...node,
      validatedSemanticCode: this.nodeValidationService.generateSemanticCode(node),
      validationState: 'validated' as const,
      status: 'configured' as const
    }));

    this.composer.update((state) => ({
      ...state,
      selectedNodeId: contextNode.id,
      canvasNodes: [contextNode, ...draftedNodes],
      connections: draft.connections
    }));
  }

  protected openDslPreview(): void {
    this.isDslPreviewOpen.set(true);
  }

  protected openProjectValidation(): void {
    this.isProjectValidationOpen.set(true);
  }

  protected saveProject(): void {
    const payload = this.composerProjectFileService.serialize({
      version: 1,
      modelName: this.modelName(),
      selectedNodeId: this.composer().selectedNodeId,
      canvasNodes: this.composer().canvasNodes,
      connections: this.composer().connections
    });
    const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${this.toFileSafeName(this.modelName())}.darkfactor-project.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  protected requestProjectLoad(): void {
    this.projectFileInput?.nativeElement.click();
  }

  protected async onProjectFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      const project = this.composerProjectFileService.parse(raw);
      this.modelName.set(project.modelName);
      this.composer.update((state) => ({
        ...state,
        selectedNodeId: project.selectedNodeId,
        canvasNodes: project.canvasNodes,
        connections: project.connections
      }));
    } catch (error) {
      console.error(error);
      window.alert('The selected project file could not be loaded.');
    } finally {
      input.value = '';
    }
  }

  protected closeDslPreview(): void {
    this.isDslPreviewOpen.set(false);
  }

  protected closeProjectValidation(): void {
    this.isProjectValidationOpen.set(false);
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
    this.pendingConnectionSourceId.set(null);
    this.closeDslPreview();
    this.closeProjectValidation();
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
      semanticKey: this.nodeValidationService.defaultKey(item.type, normalizedName),
      semanticKind: this.nodeValidationService.defaultKind(item.type),
      contextBrief: item.type === 'applicationContext'
        ? {
            context: '',
            objective: '',
            constraints: '',
            safetyConcerns: ''
          }
        : null,
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

    if (!node.semanticKey.trim()) {
      return 'draft';
    }

    if (node.type === 'applicationContext' && (!node.contextBrief?.context.trim() || !node.contextBrief?.objective.trim())) {
      return 'draft';
    }

    if ((node.type === 'task' || node.type === 'rule' || node.type === 'integration') && !node.semanticKind?.trim()) {
      return 'draft';
    }

    if (node.validationState === 'invalid') {
      return 'warning';
    }

    return node.validationState === 'validated' ? 'configured' : 'draft';
  }

  private createAutoConnection(
    selectedNodeId: string | null,
    existingNodes: CanvasNode[],
    newNode: CanvasNode,
    existingConnections: CanvasConnection[]
  ): CanvasConnection[] {
    if (!selectedNodeId) {
      return existingConnections;
    }

    const sourceNode = existingNodes.find((node) => node.id === selectedNodeId);
    if (!sourceNode) {
      return existingConnections;
    }

    if (!this.semanticLinkRulesService.isAllowed(sourceNode.type, newNode.type)) {
      return existingConnections;
    }

    return [
      ...existingConnections,
      {
        id: `conn-${selectedNodeId}-${newNode.id}`,
        sourceNodeId: selectedNodeId,
        targetNodeId: newNode.id,
        label: this.semanticLinkRulesService.defaultRelation(sourceNode.type, newNode.type) ?? undefined
      }
    ];
  }

  private toFileSafeName(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'semantic-project';
  }

  private formatIssues(issues: SemanticProjectionResult['validationIssues']): string {
    return issues
      .map((issue) => `[${issue.severity.toUpperCase()}] ${issue.code}: ${issue.message}`)
      .join('\n');
  }
}
