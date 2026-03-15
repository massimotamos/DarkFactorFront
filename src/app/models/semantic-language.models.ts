import { CanvasConnection, CanvasNode, PaletteCategory } from './composer.models';
import {
  ApplicationAst,
  AstValidationIssue,
  FormMode,
  IntegrationProtocol,
  InvocationKind,
  NotificationChannel
} from './semantic-ast.models';

export interface SemanticProjectionResult {
  ast: ApplicationAst;
  source: {
    nodes: CanvasNode[];
    connections: CanvasConnection[];
  };
  validationIssues: AstValidationIssue[];
}

export function mapNodeTypeToInvocationKind(nodeType: string): InvocationKind | null {
  switch (nodeType) {
    case 'start':
      return 'StartInvocation';
    case 'end':
      return 'EndInvocation';
    case 'page':
      return 'ShowPageInvocation';
    case 'form':
      return 'FormInvocation';
    case 'validation':
      return 'ValidationInvocation';
    case 'restCall':
    case 'soapCall':
    case 'messageQueue':
    case 'webhook':
      return 'IntegrationInvocation';
    case 'approval':
      return 'ApprovalInvocation';
    case 'notification':
      return 'NotificationInvocation';
    case 'entity':
    case 'role':
    case 'policy':
    case 'table':
    case 'modal':
    case 'apiSource':
      return null;
    default:
      return 'TaskInvocation';
  }
}

export function inferIntegrationProtocol(nodeType: string): IntegrationProtocol {
  switch (nodeType) {
    case 'soapCall':
      return 'SOAP';
    case 'messageQueue':
      return 'MQ';
    case 'webhook':
      return 'Webhook';
    case 'databaseSource':
      return 'Database';
    default:
      return 'REST';
  }
}

export function inferNotificationChannel(node: CanvasNode): NotificationChannel {
  const channelProperty = node.properties.find((property) => property.key === 'channel')?.value;

  switch (channelProperty?.toLowerCase()) {
    case 'sms':
      return 'SMS';
    case 'webhook':
      return 'Webhook';
    case 'internal':
      return 'Internal';
    default:
      return 'Email';
  }
}

export function defaultFormMode(category: PaletteCategory): FormMode {
  return category === 'ui-elements' ? 'Create' : 'View';
}
