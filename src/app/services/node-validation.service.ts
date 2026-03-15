import { Injectable } from '@angular/core';
import { CanvasNode, ComposerNodeType } from '../models/composer.models';

@Injectable({ providedIn: 'root' })
export class NodeValidationService {
  generateSemanticCode(node: CanvasNode): string {
    switch (node.type) {
      case 'applicationContext':
        return this.renderApplicationContext(node);
      case 'role':
        return this.renderRole(node);
      case 'entity':
        return this.renderEntity(node);
      case 'view':
        return this.renderView(node);
      case 'task':
        return this.renderTask(node);
      case 'rule':
        return this.renderRule(node);
      default:
        return this.renderIntegration(node);
    }
  }

  defaultKind(type: ComposerNodeType): string | null {
    switch (type) {
      case 'task':
        return 'business';
      case 'rule':
        return 'validation';
      case 'integration':
        return 'external-api';
      default:
        return null;
    }
  }

  defaultKey(type: ComposerNodeType, name: string): string {
    return `${type}.${name}`;
  }

  private renderRole(node: CanvasNode): string {
    return [
      `role ${node.name} {`,
      `  key "${node.semanticKey}"`,
      `  label "${node.label}"`,
      `  description "${this.escape(node.description)}"`,
      `  prompt "${this.escape(this.normalizePrompt(node.prompt))}"`,
      '}'
    ].join('\n');
  }

  private renderApplicationContext(node: CanvasNode): string {
    const brief = node.contextBrief ?? {
      context: '',
      objective: '',
      constraints: '',
      safetyConcerns: ''
    };

    return [
      `applicationContext ${node.name} {`,
      `  key "${node.semanticKey}"`,
      `  label "${node.label}"`,
      `  description "${this.escape(node.description)}"`,
      `  context "${this.escape(brief.context)}"`,
      `  objective "${this.escape(brief.objective)}"`,
      `  constraints "${this.escape(brief.constraints)}"`,
      `  safety "${this.escape(brief.safetyConcerns)}"`,
      `  prompt "${this.escape(this.normalizePrompt(node.prompt))}"`,
      '}'
    ].join('\n');
  }

  private renderEntity(node: CanvasNode): string {
    return [
      `entity ${node.name} {`,
      `  key "${node.semanticKey}"`,
      `  label "${node.label}"`,
      `  description "${this.escape(node.description)}"`,
      `  prompt "${this.escape(this.normalizePrompt(node.prompt))}"`,
      '}'
    ].join('\n');
  }

  private renderView(node: CanvasNode): string {
    return [
      `view ${node.name} {`,
      `  key "${node.semanticKey}"`,
      `  label "${node.label}"`,
      `  description "${this.escape(node.description)}"`,
      `  prompt "${this.escape(this.normalizePrompt(node.prompt))}"`,
      '}'
    ].join('\n');
  }

  private renderTask(node: CanvasNode): string {
    return [
      `task ${node.name} {`,
      `  kind ${node.semanticKind ?? 'business'}`,
      `  key "${node.semanticKey}"`,
      `  label "${node.label}"`,
      `  description "${this.escape(node.description)}"`,
      `  prompt "${this.escape(this.normalizePrompt(node.prompt))}"`,
      '}'
    ].join('\n');
  }

  private renderRule(node: CanvasNode): string {
    return [
      `rule ${node.name} {`,
      `  kind ${node.semanticKind ?? 'validation'}`,
      `  key "${node.semanticKey}"`,
      `  label "${node.label}"`,
      `  description "${this.escape(node.description)}"`,
      `  prompt "${this.escape(this.normalizePrompt(node.prompt))}"`,
      '}'
    ].join('\n');
  }

  private renderIntegration(node: CanvasNode): string {
    return [
      `integration ${node.name} {`,
      `  kind ${node.semanticKind ?? 'external-api'}`,
      `  key "${node.semanticKey}"`,
      `  label "${node.label}"`,
      `  description "${this.escape(node.description)}"`,
      `  prompt "${this.escape(this.normalizePrompt(node.prompt))}"`,
      '}'
    ].join('\n');
  }

  private normalizePrompt(prompt: string): string {
    return prompt.trim() || 'No prompt provided.';
  }

  private escape(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }
}
