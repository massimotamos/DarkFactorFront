import { Injectable } from '@angular/core';
import { CanvasConnection, CanvasNode, ComposerNodeType } from '../models/composer.models';
import { ComposerProjectFile, ComposerProjectFileService } from './composer-project-file.service';
import { SemanticProjectionResult } from '../models/semantic-language.models';
import { SemanticDslRendererService } from './semantic-dsl-renderer.service';

@Injectable({ providedIn: 'root' })
export class SemanticDslProjectService {
  constructor(
    private readonly composerProjectFileService: ComposerProjectFileService,
    private readonly semanticDslRendererService: SemanticDslRendererService
  ) {}

  serialize(modelName: string, projection: SemanticProjectionResult): string {
    return [
      '# DarkFactor Semantic DSL v1',
      `# Model: ${modelName}`,
      '',
      this.semanticDslRendererService.render(projection.ast)
    ].join('\n');
  }

  parse(raw: string): ComposerProjectFile {
    const trimmed = raw.trim();
    if (trimmed.startsWith('{')) {
      return this.composerProjectFileService.parse(trimmed);
    }

    return this.parseDsl(trimmed);
  }

  private parseDsl(raw: string): ComposerProjectFile {
    const cleaned = raw
      .split('\n')
      .filter((line) => !line.trim().startsWith('#'))
      .join('\n');

    const modelNameMatch = cleaned.match(/application\s+"([^"]+)"\s*\{/);
    if (!modelNameMatch) {
      throw new Error('Invalid DSL: missing application header.');
    }

    const modelName = modelNameMatch[1];
    const canvasNodes = this.parseNodes(cleaned);
    const connections = this.parseLinks(cleaned, canvasNodes);

    return {
      version: 1,
      modelName,
      selectedNodeId: canvasNodes[0]?.id ?? null,
      canvasNodes,
      connections
    };
  }

  private parseNodes(raw: string): CanvasNode[] {
    const nodes: CanvasNode[] = [];
    const nodeRegex = /(?:^|\n)\s{2}(applicationContext|role|entity|view|task|rule|integration)\s+([A-Za-z0-9_]+)\s*\{([\s\S]*?)\n\s{2}\}/g;
    let match: RegExpExecArray | null;

    while ((match = nodeRegex.exec(raw)) !== null) {
      const type = match[1] as ComposerNodeType;
      const name = match[2];
      const body = match[3];
      const key = this.extractQuoted(body, 'key') ?? `${type}.${name}`;
      const label = this.extractQuoted(body, 'label') ?? name;
      const description = this.extractQuoted(body, 'description') ?? '';
      const prompt = this.extractQuoted(body, 'prompt') ?? '';
      const kind = this.extractBare(body, 'kind');
      const layoutMatch = body.match(/layout\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)/);
      const context = this.extractQuoted(body, 'context');
      const objective = this.extractQuoted(body, 'objective');
      const constraints = this.extractQuoted(body, 'constraints');
      const safety = this.extractQuoted(body, 'safety');
      const semanticCode = this.extractSemantics(body);

      nodes.push({
        id: `node-${key}`,
        type,
        category: this.categoryFor(type),
        name,
        label,
        description,
        semanticKey: key,
        semanticKind: kind,
        contextBrief: type === 'applicationContext'
          ? {
              context: context ?? '',
              objective: objective ?? '',
              constraints: constraints ?? '',
              safetyConcerns: safety ?? ''
            }
          : null,
        prompt,
        validatedSemanticCode: semanticCode,
        validationState: semanticCode ? 'validated' : 'unvalidated',
        position: {
          x: layoutMatch ? Number(layoutMatch[1]) : 80,
          y: layoutMatch ? Number(layoutMatch[2]) : 80
        },
        size: {
          width: layoutMatch ? Number(layoutMatch[3]) : 220,
          height: layoutMatch ? Number(layoutMatch[4]) : 110
        },
        status: semanticCode ? 'configured' : 'draft',
        properties: []
      });
    }

    return nodes;
  }

  private parseLinks(raw: string, nodes: CanvasNode[]): CanvasConnection[] {
    const linksMatch = raw.match(/links\s*\{([\s\S]*?)\n\}/);
    if (!linksMatch) {
      return [];
    }

    const nodeIdByKey = new Map(nodes.map((node) => [node.semanticKey, node.id]));

    return linksMatch[1]
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('link '))
      .map((line, index) => {
        const match = line.match(/^link\s+([A-Za-z0-9._-]+)\s+->\s+([A-Za-z0-9._-]+)(?:\s+as\s+"([^"]+)")?$/);
        if (!match) {
          throw new Error(`Invalid DSL link: ${line}`);
        }

        const sourceNodeId = nodeIdByKey.get(match[1]);
        const targetNodeId = nodeIdByKey.get(match[2]);
        if (!sourceNodeId || !targetNodeId) {
          throw new Error(`DSL link references unknown semantic key: ${line}`);
        }

        return {
          id: `dsl-link-${index}`,
          sourceNodeId,
          targetNodeId,
          label: match[3]
        };
      });
  }

  private extractQuoted(body: string, key: string): string | null {
    const match = body.match(new RegExp(`${key}\\s+"((?:[^"\\\\]|\\\\.)*)"`, 'm'));
    return match ? this.unescape(match[1]) : null;
  }

  private extractBare(body: string, key: string): string | null {
    const match = body.match(new RegExp(`${key}\\s+([A-Za-z0-9._-]+)`, 'm'));
    return match ? match[1] : null;
  }

  private extractSemantics(body: string): string {
    const match = body.match(/semantics\s+<<\n([\s\S]*?)\n\s*>>/);
    if (!match) {
      return '';
    }

    return match[1]
      .split('\n')
      .map((line) => line.replace(/^\s{4}/, ''))
      .join('\n');
  }

  private categoryFor(type: ComposerNodeType): CanvasNode['category'] {
    switch (type) {
      case 'applicationContext':
        return 'foundation';
      case 'role':
        return 'security';
      case 'entity':
        return 'data';
      case 'view':
        return 'experience';
      case 'task':
      case 'rule':
        return 'behavior';
      default:
        return 'integration';
    }
  }

  private unescape(value: string): string {
    return value.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
}
