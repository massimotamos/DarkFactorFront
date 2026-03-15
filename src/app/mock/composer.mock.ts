import { ComposerMockModel } from '../models/composer.models';

export const COMPOSER_MOCK_MODEL: ComposerMockModel = {
  palette: [
    {
      id: 'ui-elements',
      label: 'UI Elements',
      items: [
        {
          id: 'page',
          type: 'page',
          category: 'ui-elements',
          label: 'Page',
          description: 'Top-level application screen with layout regions.',
          icon: 'P',
          accent: 'accent-ui'
        },
        {
          id: 'form',
          type: 'form',
          category: 'ui-elements',
          label: 'Form',
          description: 'Structured data entry surface with bound inputs.',
          icon: 'F',
          accent: 'accent-ui'
        },
        {
          id: 'table',
          type: 'table',
          category: 'ui-elements',
          label: 'Table',
          description: 'Tabular presentation of entity collections.',
          icon: 'T',
          accent: 'accent-ui'
        },
        {
          id: 'modal',
          type: 'modal',
          category: 'ui-elements',
          label: 'Modal',
          description: 'Overlay interaction for focused secondary tasks.',
          icon: 'M',
          accent: 'accent-ui'
        }
      ]
    },
    {
      id: 'logic',
      label: 'Logic',
      items: [
        {
          id: 'validation',
          type: 'validation',
          category: 'logic',
          label: 'Validation',
          description: 'Semantic validation constraint for input and data flow.',
          icon: 'V',
          accent: 'accent-logic'
        },
        {
          id: 'condition',
          type: 'condition',
          category: 'logic',
          label: 'Condition',
          description: 'Decision branch based on business rules.',
          icon: 'C',
          accent: 'accent-logic'
        },
        {
          id: 'mapping',
          type: 'mapping',
          category: 'logic',
          label: 'Mapping',
          description: 'Structural mapping between view and data semantics.',
          icon: 'Mp',
          accent: 'accent-logic'
        }
      ]
    },
    {
      id: 'data',
      label: 'Data',
      items: [
        {
          id: 'entity',
          type: 'entity',
          category: 'data',
          label: 'Entity',
          description: 'Business object model with fields and relationships.',
          icon: 'E',
          accent: 'accent-data'
        },
        {
          id: 'api-source',
          type: 'apiSource',
          category: 'data',
          label: 'API Source',
          description: 'Remote data provider for runtime data binding.',
          icon: 'API',
          accent: 'accent-data'
        }
      ]
    },
    {
      id: 'workflow',
      label: 'Workflow',
      items: [
        {
          id: 'start',
          type: 'start',
          category: 'workflow',
          label: 'Start',
          description: 'Entry marker for semantic process orchestration.',
          icon: 'S',
          accent: 'accent-workflow'
        },
        {
          id: 'task',
          type: 'task',
          category: 'workflow',
          label: 'Task',
          description: 'Executable user or system activity placeholder.',
          icon: 'Tk',
          accent: 'accent-workflow'
        }
      ]
    },
    {
      id: 'security',
      label: 'Security',
      items: [
        {
          id: 'role',
          type: 'role',
          category: 'security',
          label: 'Role',
          description: 'Access profile for user capabilities.',
          icon: 'R',
          accent: 'accent-security'
        },
        {
          id: 'policy',
          type: 'policy',
          category: 'security',
          label: 'Policy',
          description: 'Constraint definition for platform governance.',
          icon: 'Po',
          accent: 'accent-security'
        }
      ]
    },
    {
      id: 'integration',
      label: 'Integration',
      items: [
        {
          id: 'rest-call',
          type: 'restCall',
          category: 'integration',
          label: 'REST Call',
          description: 'HTTP-based external service interaction.',
          icon: 'Re',
          accent: 'accent-integration'
        },
        {
          id: 'webhook',
          type: 'webhook',
          category: 'integration',
          label: 'Webhook',
          description: 'Inbound or outbound event-driven endpoint.',
          icon: 'Wh',
          accent: 'accent-integration'
        }
      ]
    }
  ],
  selectedNodeId: 'node-customer-registration',
  canvasNodes: [
    {
      id: 'node-start',
      type: 'start',
      category: 'workflow',
      name: 'startRegistration',
      label: 'Start',
      description: 'Entry point for the customer registration semantic flow.',
      position: { x: 96, y: 200 },
      size: { width: 160, height: 92 },
      status: 'configured',
      properties: [
        { key: 'trigger', label: 'Trigger', value: 'User initiates onboarding', group: 'behavior' }
      ]
    },
    {
      id: 'node-customer-registration',
      type: 'form',
      category: 'ui-elements',
      name: 'customerRegistrationForm',
      label: 'Customer Registration',
      description: 'Data capture form collecting customer identity and contact information.',
      position: { x: 324, y: 178 },
      size: { width: 220, height: 110 },
      status: 'configured',
      properties: [
        { key: 'route', label: 'Route', value: '/customers/register', group: 'general' },
        { key: 'mode', label: 'Mode', value: 'Create', group: 'behavior' }
      ]
    },
    {
      id: 'node-validation',
      type: 'validation',
      category: 'logic',
      name: 'registrationValidation',
      label: 'Validation',
      description: 'Validates mandatory fields and semantic consistency before integration.',
      position: { x: 612, y: 188 },
      size: { width: 196, height: 96 },
      status: 'configured',
      properties: [
        { key: 'ruleSet', label: 'Rule Set', value: 'CustomerRegistrationRules', group: 'behavior' }
      ]
    },
    {
      id: 'node-rest-call',
      type: 'restCall',
      category: 'integration',
      name: 'createCustomerRequest',
      label: 'REST Call',
      description: 'Creates the customer record in the remote onboarding service.',
      position: { x: 880, y: 188 },
      size: { width: 196, height: 96 },
      status: 'configured',
      properties: [
        { key: 'endpoint', label: 'Endpoint', value: 'POST /api/customers', group: 'integration' }
      ]
    },
    {
      id: 'node-approval',
      type: 'approval',
      category: 'workflow',
      name: 'managerApproval',
      label: 'Approval',
      description: 'Routes the pending registration to a manager for sign-off.',
      position: { x: 1148, y: 188 },
      size: { width: 188, height: 96 },
      status: 'configured',
      properties: [
        { key: 'approverRole', label: 'Approver Role', value: 'Customer Manager', group: 'security' }
      ]
    },
    {
      id: 'node-notification',
      type: 'notification',
      category: 'workflow',
      name: 'registrationNotification',
      label: 'Notification',
      description: 'Sends a confirmation notification once approval is completed.',
      position: { x: 1412, y: 188 },
      size: { width: 204, height: 96 },
      status: 'configured',
      properties: [
        { key: 'channel', label: 'Channel', value: 'Email', group: 'behavior' }
      ]
    },
    {
      id: 'node-end',
      type: 'end',
      category: 'workflow',
      name: 'registrationCompleted',
      label: 'End',
      description: 'Completes the customer registration semantic flow.',
      position: { x: 1690, y: 200 },
      size: { width: 160, height: 92 },
      status: 'configured',
      properties: [
        { key: 'result', label: 'Result', value: 'Customer registered', group: 'general' }
      ]
    }
  ],
  connections: [
    { id: 'conn-start-form', sourceNodeId: 'node-start', targetNodeId: 'node-customer-registration', label: 'begin' },
    { id: 'conn-form-validation', sourceNodeId: 'node-customer-registration', targetNodeId: 'node-validation', label: 'submit' },
    { id: 'conn-validation-rest', sourceNodeId: 'node-validation', targetNodeId: 'node-rest-call', label: 'valid' },
    { id: 'conn-rest-approval', sourceNodeId: 'node-rest-call', targetNodeId: 'node-approval', label: 'created' },
    { id: 'conn-approval-notification', sourceNodeId: 'node-approval', targetNodeId: 'node-notification', label: 'approved' },
    { id: 'conn-notification-end', sourceNodeId: 'node-notification', targetNodeId: 'node-end', label: 'complete' }
  ]
};
