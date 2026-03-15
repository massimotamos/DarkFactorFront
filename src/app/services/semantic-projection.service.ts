import { Injectable } from '@angular/core';
import { CanvasConnection, CanvasNode, CanvasNodeProperty } from '../models/composer.models';
import {
  defaultFormMode,
  inferIntegrationProtocol,
  inferNotificationChannel,
  mapNodeTypeToInvocationKind,
  SemanticProjectionResult
} from '../models/semantic-language.models';
import {
  ApplicationAst,
  TransitionAst,
  WorkflowAst,
  WorkflowInvocationAst
} from '../models/semantic-ast.models';
import { SemanticValidatorService } from './semantic-validator.service';

@Injectable({ providedIn: 'root' })
export class SemanticProjectionService {
  constructor(private readonly semanticValidatorService: SemanticValidatorService) {}

  project(modelName: string, nodes: CanvasNode[], connections: CanvasConnection[]): SemanticProjectionResult {
    const ast = this.toAst(modelName, nodes, connections);

    return {
      ast,
      source: {
        nodes,
        connections
      },
      validationIssues: this.semanticValidatorService.validate(ast)
    };
  }

  private toAst(modelName: string, nodes: CanvasNode[], connections: CanvasConnection[]): ApplicationAst {
    const invocationNodes = nodes.filter((node) => mapNodeTypeToInvocationKind(node.type) !== null);
    const workflows = this.buildWorkflows(invocationNodes, connections);

    return {
      kind: 'ApplicationAst',
      name: modelName,
      version: '0.1.0',
      workflows,
      pages: nodes
        .filter((node) => node.type === 'page')
        .map((node) => ({
          kind: 'PageDeclaration' as const,
          id: `page-${node.id}`,
          name: node.name,
          label: node.label,
          description: node.description,
          route: this.getProperty(node.properties, 'route')
        })),
      forms: nodes
        .filter((node) => node.type === 'form')
        .map((node) => ({
          kind: 'FormDeclaration' as const,
          id: `form-${node.id}`,
          name: node.name,
          label: node.label,
          description: node.description,
          mode: defaultFormMode(node.category)
        })),
      entities: nodes
        .filter((node) => node.type === 'entity')
        .map((node) => ({
          kind: 'EntityDeclaration' as const,
          id: `entity-${node.id}`,
          name: node.name,
          label: node.label,
          description: node.description
        })),
      ruleSets: nodes
        .filter((node) => node.type === 'validation')
        .map((node) => ({
          kind: 'RuleSetDeclaration' as const,
          id: `rules-${node.id}`,
          name: `${node.name}RuleSet`,
          label: node.label,
          description: node.description,
          ruleNames: [this.getProperty(node.properties, 'ruleSet') ?? 'UnnamedRuleSet']
        })),
      integrations: nodes
        .filter((node) => node.type === 'restCall' || node.type === 'soapCall' || node.type === 'messageQueue' || node.type === 'webhook')
        .map((node) => ({
          kind: 'IntegrationDeclaration' as const,
          id: `integration-${node.id}`,
          name: node.name,
          label: node.label,
          description: node.description,
          protocol: inferIntegrationProtocol(node.type),
          endpoint: this.getProperty(node.properties, 'endpoint') ?? 'undefined',
          method: this.getProperty(node.properties, 'method') ?? undefined
        })),
      roles: nodes
        .filter((node) => node.type === 'role')
        .map((node) => ({
          kind: 'RoleDeclaration' as const,
          id: `role-${node.id}`,
          name: node.name,
          label: node.label,
          description: node.description
        })),
      policies: nodes
        .filter((node) => node.type === 'policy')
        .map((node) => ({
          kind: 'PolicyDeclaration' as const,
          id: `policy-${node.id}`,
          name: node.name,
          label: node.label,
          description: node.description
        })),
      notifications: nodes
        .filter((node) => node.type === 'notification')
        .map((node) => ({
          kind: 'NotificationDeclaration' as const,
          id: `notification-${node.id}`,
          name: node.name,
          label: node.label,
          description: node.description,
          channel: inferNotificationChannel(node)
        }))
    };
  }

  private buildWorkflows(nodes: CanvasNode[], connections: CanvasConnection[]): WorkflowAst[] {
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    const invocationNodeIds = new Set(nodes.map((node) => node.id));
    const relevantConnections = connections.filter(
      (connection) => invocationNodeIds.has(connection.sourceNodeId) && invocationNodeIds.has(connection.targetNodeId)
    );

    const adjacency = new Map<string, Set<string>>();
    for (const node of nodes) {
      adjacency.set(node.id, new Set<string>());
    }

    for (const connection of relevantConnections) {
      adjacency.get(connection.sourceNodeId)?.add(connection.targetNodeId);
      adjacency.get(connection.targetNodeId)?.add(connection.sourceNodeId);
    }

    const components: string[][] = [];
    const visited = new Set<string>();

    for (const node of nodes) {
      if (visited.has(node.id)) {
        continue;
      }

      const queue = [node.id];
      const component: string[] = [];
      visited.add(node.id);

      while (queue.length > 0) {
        const current = queue.shift()!;
        component.push(current);

        for (const neighbor of adjacency.get(current) ?? []) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }

      if (component.some((id) => nodeMap.get(id)?.type === 'start')) {
        components.push(component);
      }
    }

    return components.map((componentNodeIds, index) => {
      const workflowNodes = componentNodeIds
        .map((id) => nodeMap.get(id))
        .filter((node): node is CanvasNode => Boolean(node));
      const workflowTransitions = relevantConnections
        .filter(
          (connection) =>
            componentNodeIds.includes(connection.sourceNodeId) &&
            componentNodeIds.includes(connection.targetNodeId)
        )
        .map<TransitionAst>((connection) => ({
          id: connection.id,
          fromInvocationId: connection.sourceNodeId,
          toInvocationId: connection.targetNodeId,
          label: connection.label
        }));

      const startNode = workflowNodes.find((node) => node.type === 'start') ?? workflowNodes[0];
      const workflowName = this.getProperty(startNode.properties, 'workflowName') ?? `workflow${index + 1}`;
      const workflowLabel = this.getProperty(startNode.properties, 'workflowLabel') ?? startNode.label;

      return {
        kind: 'WorkflowDeclaration' as const,
        id: `workflow-${workflowName}`,
        name: workflowName,
        label: workflowLabel,
        description: startNode.description,
        invocations: workflowNodes.map((node) => this.toInvocation(node)),
        transitions: workflowTransitions
      };
    });
  }

  private toInvocation(node: CanvasNode): WorkflowInvocationAst {
    const invocationKind = mapNodeTypeToInvocationKind(node.type);

    switch (invocationKind) {
      case 'StartInvocation':
        return {
          invocationKind,
          id: node.id,
          name: node.name,
          label: node.label,
          description: node.description,
          sourceNodeId: node.id
        };
      case 'EndInvocation':
        return {
          invocationKind,
          id: node.id,
          name: node.name,
          label: node.label,
          description: node.description,
          sourceNodeId: node.id
        };
      case 'ShowPageInvocation':
        return {
          invocationKind,
          id: node.id,
          name: node.name,
          label: node.label,
          description: node.description,
          sourceNodeId: node.id,
          pageRef: `page-${node.id}`
        };
      case 'FormInvocation':
        return {
          invocationKind,
          id: node.id,
          name: node.name,
          label: node.label,
          description: node.description,
          sourceNodeId: node.id,
          formRef: `form-${node.id}`
        };
      case 'ValidationInvocation':
        return {
          invocationKind,
          id: node.id,
          name: node.name,
          label: node.label,
          description: node.description,
          sourceNodeId: node.id,
          ruleSetRef: `rules-${node.id}`
        };
      case 'IntegrationInvocation':
        return {
          invocationKind,
          id: node.id,
          name: node.name,
          label: node.label,
          description: node.description,
          sourceNodeId: node.id,
          integrationRef: `integration-${node.id}`
        };
      case 'ApprovalInvocation':
        return {
          invocationKind,
          id: node.id,
          name: node.name,
          label: node.label,
          description: node.description,
          sourceNodeId: node.id,
          roleRef: this.getProperty(node.properties, 'roleRef') ?? 'role-node-sales-manager'
        };
      case 'NotificationInvocation':
        return {
          invocationKind,
          id: node.id,
          name: node.name,
          label: node.label,
          description: node.description,
          sourceNodeId: node.id,
          notificationRef: `notification-${node.id}`
        };
      default:
        return {
          invocationKind: 'TaskInvocation',
          id: node.id,
          name: node.name,
          label: node.label,
          description: node.description,
          sourceNodeId: node.id
        };
    }
  }

  private getProperty(properties: CanvasNodeProperty[], key: string): string | undefined {
    return properties.find((property) => property.key === key)?.value;
  }
}
