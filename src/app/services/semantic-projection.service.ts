import { Injectable } from '@angular/core';
import { CanvasConnection, CanvasNode } from '../models/composer.models';
import { FullStackApplicationAst } from '../models/semantic-ast.models';
import { classifyNodeGroup, SemanticProjectionResult } from '../models/semantic-language.models';
import { SemanticValidatorService } from './semantic-validator.service';

@Injectable({ providedIn: 'root' })
export class SemanticProjectionService {
  constructor(private readonly semanticValidatorService: SemanticValidatorService) {}

  project(modelName: string, nodes: CanvasNode[], connections: CanvasConnection[]): SemanticProjectionResult {
    const ast = this.toAst(modelName, nodes, connections);
    return {
      ast,
      source: { nodes, connections },
      validationIssues: this.semanticValidatorService.validate(ast)
    };
  }

  private toAst(modelName: string, nodes: CanvasNode[], connections: CanvasConnection[]): FullStackApplicationAst {
    const ast: FullStackApplicationAst = {
      kind: 'FullStackApplicationAst',
      targetStack: {
        frontend: 'Angular',
        backend: 'SpringBoot',
        build: 'Maven'
      },
      application: {
        name: modelName,
        nodeCount: nodes.length,
        connectionCount: connections.length
      },
      applicationContexts: [],
      roles: [],
      entities: [],
      views: [],
      tasks: [],
      rules: [],
      integrations: [],
      links: connections.map((connection) => ({
        id: connection.id,
        from: connection.sourceNodeId,
        to: connection.targetNodeId,
        label: connection.label
      }))
    };

    for (const node of nodes) {
      ast[classifyNodeGroup(node.type)].push({
        id: node.id,
        type: node.type,
        name: node.name,
        key: node.semanticKey,
        kind: node.semanticKind,
        label: node.label,
        description: node.description,
        layout: {
          x: node.position.x,
          y: node.position.y,
          width: node.size.width,
          height: node.size.height
        },
        contextBrief: node.contextBrief,
        prompt: node.prompt,
        semanticCode: node.validatedSemanticCode
      });
    }

    return ast;
  }
}
