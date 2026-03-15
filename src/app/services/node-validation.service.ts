import { Injectable } from '@angular/core';
import { CanvasNode } from '../models/composer.models';

@Injectable({ providedIn: 'root' })
export class NodeValidationService {
  generateSemanticCode(node: CanvasNode): string {
    const normalizedPrompt = node.prompt.trim() || 'No prompt provided';

    switch (node.type) {
      case 'entity':
        return [
          `entity ${node.name} {`,
          `  label: "${node.label}"`,
          `  intent: "${normalizedPrompt}"`,
          '}'
        ].join('\n');
      case 'page':
        return [
          `page ${node.name} {`,
          `  route: "${this.extractPromptValue(node.prompt, '/'+node.name.toLowerCase())}"`,
          `  label: "${node.label}"`,
          `  purpose: "${normalizedPrompt}"`,
          '}'
        ].join('\n');
      case 'service':
        return [
          `service ${node.name} {`,
          `  layer: "spring-service"`,
          `  responsibility: "${normalizedPrompt}"`,
          '}'
        ].join('\n');
      case 'endpoint':
        return [
          `endpoint ${node.name} {`,
          `  method: "${this.inferHttpMethod(node.prompt)}"`,
          `  path: "${this.extractPromptValue(node.prompt, '/api/' + node.name.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()).replace(/^-/, ''))}"`,
          `  contract: "${normalizedPrompt}"`,
          '}'
        ].join('\n');
      case 'condition':
        return [
          `condition ${node.name} {`,
          `  expression: "${normalizedPrompt}"`,
          '}'
        ].join('\n');
      default:
        return [
          `action ${node.name} {`,
          `  label: "${node.label}"`,
          `  intent: "${normalizedPrompt}"`,
          '}'
        ].join('\n');
    }
  }

  private inferHttpMethod(prompt: string): string {
    const normalized = prompt.toLowerCase();
    if (normalized.includes('create') || normalized.includes('add')) {
      return 'POST';
    }
    if (normalized.includes('update') || normalized.includes('set')) {
      return 'PUT';
    }
    if (normalized.includes('delete') || normalized.includes('remove')) {
      return 'DELETE';
    }
    return 'GET';
  }

  private extractPromptValue(prompt: string, fallback: string): string {
    const trimmed = prompt.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }
}
