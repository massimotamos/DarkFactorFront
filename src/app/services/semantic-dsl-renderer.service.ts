import { Injectable } from '@angular/core';
import { FullStackApplicationAst, SemanticLinkAst, SemanticNodeAst } from '../models/semantic-ast.models';

@Injectable({ providedIn: 'root' })
export class SemanticDslRendererService {
  render(ast: FullStackApplicationAst): string {
    const sections = [
      this.renderHeader(ast),
      this.renderNodeBlock('entities', ast.entities),
      this.renderNodeBlock('pages', ast.pages),
      this.renderNodeBlock('services', ast.services),
      this.renderNodeBlock('endpoints', ast.endpoints),
      this.renderNodeBlock('actions', ast.actions),
      this.renderNodeBlock('conditions', ast.conditions),
      this.renderLinks(ast.links)
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
      `  label "${this.escape(node.label)}"`,
      `  description "${this.escape(node.description)}"`
    ];

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

  private renderLinks(links: SemanticLinkAst[]): string {
    if (links.length === 0) {
      return '';
    }

    const lines = links.map((link) =>
      `  link ${link.from} -> ${link.to}${link.label ? ` as "${this.escape(link.label)}"` : ''}`
    );

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
