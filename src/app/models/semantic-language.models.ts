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
  | 'entities'
  | 'pages'
  | 'services'
  | 'endpoints'
  | 'actions'
  | 'conditions' {
  switch (type) {
    case 'entity':
      return 'entities';
    case 'page':
      return 'pages';
    case 'service':
      return 'services';
    case 'endpoint':
      return 'endpoints';
    case 'condition':
      return 'conditions';
    default:
      return 'actions';
  }
}
