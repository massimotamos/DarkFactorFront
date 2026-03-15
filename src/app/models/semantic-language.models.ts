import { CanvasConnection, CanvasNode, ComposerNodeType } from './composer.models';
import { AstValidationIssue, FullStackApplicationAst } from './semantic-ast.models';

export interface SemanticProjectionResult {
  ast: FullStackApplicationAst;
  source: {
    nodes: CanvasNode[];
    connections: CanvasConnection[];
  };
  validationIssues: AstValidationIssue[];
}

export function classifyNodeGroup(type: ComposerNodeType):
  | 'applicationContexts'
  | 'roles'
  | 'entities'
  | 'views'
  | 'tasks'
  | 'rules'
  | 'integrations' {
  switch (type) {
    case 'applicationContext':
      return 'applicationContexts';
    case 'role':
      return 'roles';
    case 'entity':
      return 'entities';
    case 'view':
      return 'views';
    case 'task':
      return 'tasks';
    case 'rule':
      return 'rules';
    default:
      return 'integrations';
  }
}
