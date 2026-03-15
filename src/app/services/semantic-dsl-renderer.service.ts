import { Injectable } from '@angular/core';
import { FullStackApplicationAst, SemanticLinkAst, SemanticNodeAst } from '../models/semantic-ast.models';

@Injectable({ providedIn: 'root' })
export class SemanticDslRendererService {
  render(ast: FullStackApplicationAst): string {
    const nodesById = new Map(
      [
        ...ast.applicationContexts,
        ...ast.roles,
        ...ast.entities,
        ...ast.views,
        ...ast.tasks,
        ...ast.rules,
        ...ast.integrations
      ].map((node) => [node.id, node])
    );
    const sections = [
      this.renderHeader(ast),
      this.renderNodeBlock('applicationContexts', ast.applicationContexts),
      this.renderNodeBlock('roles', ast.roles),
      this.renderNodeBlock('entities', ast.entities),
      this.renderNodeBlock('views', ast.views),
      this.renderNodeBlock('tasks', ast.tasks),
      this.renderNodeBlock('rules', ast.rules),
      this.renderNodeBlock('integrations', ast.integrations),
      this.renderLinks(ast.links, nodesById)
    ].filter((section) => section.length > 0);

    return sections.join('\n\n');
  }

  private renderHeader(ast: FullStackApplicationAst): string {
    return [
      `application "${ast.application.name}" {`,
      `  target frontend ${ast.targetStack.frontend}`,
      `  target backend ${ast.targetStack.backend}`,
      `  target build ${ast.targetStack.build}`,
      '}'
    ].join('\n');
  }

  private renderNodeBlock(blockName: string, nodes: SemanticNodeAst[]): string {
    if (nodes.length === 0) {
      return '';
    }

    const renderedNodes = nodes
      .map((node) => this.renderNode(node))
      .map((node) => this.indent(node))
      .join('\n\n');

    return [`${blockName} {`, renderedNodes, '}'].join('\n');
  }

  private renderNode(node: SemanticNodeAst): string {
    const lines = [
      `${node.type} ${node.name} {`,
      `  key "${this.escape(node.key)}"`,
      `  label "${this.escape(node.label)}"`,
      `  description "${this.escape(node.description)}"`,
      `  layout ${node.layout.x} ${node.layout.y} ${node.layout.width} ${node.layout.height}`
    ];

    if (node.kind?.trim()) {
      lines.push(`  kind ${node.kind}`);
    }

    if (node.type === 'applicationContext' && node.contextBrief) {
      lines.push(`  context "${this.escape(node.contextBrief.context)}"`);
      lines.push(`  objective "${this.escape(node.contextBrief.objective)}"`);
      lines.push(`  constraints "${this.escape(node.contextBrief.constraints)}"`);
      lines.push(`  safety "${this.escape(node.contextBrief.safetyConcerns)}"`);
    }

    if (node.prompt.trim().length > 0) {
      lines.push(`  prompt "${this.escape(node.prompt)}"`);
    }

    if (node.semanticCode.trim().length > 0) {
      lines.push('  semantics <<');
      lines.push(...node.semanticCode.split('\n').map((line) => `    ${line}`));
      lines.push('  >>');
    }

    lines.push('}');
    return lines.join('\n');
  }

  private renderLinks(links: SemanticLinkAst[], nodesById: Map<string, SemanticNodeAst>): string {
    if (links.length === 0) {
      return '';
    }

    const lines = links
      .map((link) => {
        const source = nodesById.get(link.from);
        const target = nodesById.get(link.to);
        if (!source || !target) {
          return null;
        }

        return `  link ${source.key} -> ${target.key}${link.label ? ` as "${this.escape(link.label)}"` : ''}`;
      })
      .filter((line): line is string => !!line);

    return ['links {', ...lines, '}'].join('\n');
  }

  private indent(value: string): string {
    return value
      .split('\n')
      .map((line) => `  ${line}`)
      .join('\n');
  }

  private escape(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }
}
