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
      entities: [],
      pages: [],
      services: [],
      endpoints: [],
      actions: [],
      conditions: [],
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
        label: node.label,
        description: node.description,
        prompt: node.prompt,
        semanticCode: node.validatedSemanticCode
      });
    }

    return ast;
  }
}
