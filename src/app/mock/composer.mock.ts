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
          description: 'Top-level application view or route projection.',
          icon: 'P',
          accent: 'accent-ui'
        },
        {
          id: 'form',
          type: 'form',
          category: 'ui-elements',
          label: 'Form',
          description: 'Structured user input contract.',
          icon: 'F',
          accent: 'accent-ui'
        },
        {
          id: 'table',
          type: 'table',
          category: 'ui-elements',
          label: 'Table',
          description: 'Structured tabular data projection.',
          icon: 'T',
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
          description: 'Static or runtime semantic rule evaluation.',
          icon: 'V',
          accent: 'accent-logic'
        },
        {
          id: 'condition',
          type: 'condition',
          category: 'logic',
          label: 'Condition',
          description: 'Decision point over semantic state.',
          icon: 'C',
          accent: 'accent-logic'
        },
        {
          id: 'mapping',
          type: 'mapping',
          category: 'logic',
          label: 'Mapping',
          description: 'Data or contract transformation.',
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
          description: 'Domain model declaration.',
          icon: 'E',
          accent: 'accent-data'
        },
        {
          id: 'api-source',
          type: 'apiSource',
          category: 'data',
          label: 'API Source',
          description: 'External data source declaration.',
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
          description: 'Workflow entry point.',
          icon: 'S',
          accent: 'accent-workflow'
        },
        {
          id: 'task',
          type: 'task',
          category: 'workflow',
          label: 'Task',
          description: 'Executable semantic action.',
          icon: 'Tk',
          accent: 'accent-workflow'
        },
        {
          id: 'approval',
          type: 'approval',
          category: 'workflow',
          label: 'Approval',
          description: 'Authorization-controlled progression.',
          icon: 'Ap',
          accent: 'accent-workflow'
        },
        {
          id: 'notification',
          type: 'notification',
          category: 'workflow',
          label: 'Notification',
          description: 'Semantic notification emission.',
          icon: 'N',
          accent: 'accent-workflow'
        },
        {
          id: 'end',
          type: 'end',
          category: 'workflow',
          label: 'End',
          description: 'Workflow termination.',
          icon: 'E',
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
          description: 'Security identity declaration.',
          icon: 'R',
          accent: 'accent-security'
        },
        {
          id: 'policy',
          type: 'policy',
          category: 'security',
          label: 'Policy',
          description: 'Governance and pricing policy declaration.',
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
          description: 'HTTP integration operation.',
          icon: 'Re',
          accent: 'accent-integration'
        },
        {
          id: 'webhook',
          type: 'webhook',
          category: 'integration',
          label: 'Webhook',
          description: 'Webhook integration operation.',
          icon: 'Wh',
          accent: 'accent-integration'
        }
      ]
    }
  ],
  selectedNodeId: 'node-page-checkout',
  canvasNodes: [
    {
      id: 'node-entity-product',
      type: 'entity',
      category: 'data',
      name: 'product',
      label: 'Product',
      description: 'Catalog product with price, stock, and discount fields.',
      position: { x: 64, y: 56 },
      size: { width: 180, height: 92 },
      status: 'configured',
      properties: [
        { key: 'attributes', label: 'Attributes', value: 'sku,name,price,discount', group: 'general' }
      ]
    },
    {
      id: 'node-entity-cart',
      type: 'entity',
      category: 'data',
      name: 'cart',
      label: 'Cart',
      description: 'Shopping cart aggregate containing selected items.',
      position: { x: 314, y: 56 },
      size: { width: 170, height: 92 },
      status: 'configured',
      properties: [
        { key: 'attributes', label: 'Attributes', value: 'id,items,total', group: 'general' }
      ]
    },
    {
      id: 'node-entity-order',
      type: 'entity',
      category: 'data',
      name: 'order',
      label: 'Order',
      description: 'Completed purchase order with payment and shipment state.',
      position: { x: 564, y: 56 },
      size: { width: 170, height: 92 },
      status: 'configured',
      properties: [
        { key: 'attributes', label: 'Attributes', value: 'id,customer,total,status', group: 'general' }
      ]
    },
    {
      id: 'node-role-customer',
      type: 'role',
      category: 'security',
      name: 'customerRole',
      label: 'Customer',
      description: 'Role for storefront users purchasing products.',
      position: { x: 820, y: 56 },
      size: { width: 168, height: 92 },
      status: 'configured',
      properties: [
        { key: 'capabilities', label: 'Capabilities', value: 'browse,cart,checkout', group: 'security' }
      ]
    },
    {
      id: 'node-sales-manager',
      type: 'role',
      category: 'security',
      name: 'salesManagerRole',
      label: 'Sales Manager',
      description: 'Administrative role managing catalog pricing and discounts.',
      position: { x: 1078, y: 56 },
      size: { width: 192, height: 92 },
      status: 'configured',
      properties: [
        { key: 'capabilities', label: 'Capabilities', value: 'add,remove,price,discount', group: 'security' }
      ]
    },
    {
      id: 'node-policy-discount',
      type: 'policy',
      category: 'security',
      name: 'discountPolicy',
      label: 'Discount Policy',
      description: 'Pricing governance policy defining discount boundaries.',
      position: { x: 1362, y: 56 },
      size: { width: 184, height: 92 },
      status: 'configured',
      properties: [
        { key: 'rule', label: 'Rule', value: 'maxDiscount <= 30%', group: 'security' }
      ]
    },

    {
      id: 'node-start-customer',
      type: 'start',
      category: 'workflow',
      name: 'startCustomerPurchase',
      label: 'Start',
      description: 'Entry point for the customer shopping journey.',
      position: { x: 76, y: 224 },
      size: { width: 150, height: 88 },
      status: 'configured',
      properties: [
        { key: 'workflowName', label: 'Workflow Name', value: 'customerPurchaseFlow', group: 'general' },
        { key: 'workflowLabel', label: 'Workflow Label', value: 'Customer Purchase Flow', group: 'general' }
      ]
    },
    {
      id: 'node-page-login',
      type: 'page',
      category: 'ui-elements',
      name: 'loginPage',
      label: 'Login Page',
      description: 'Customer authentication page.',
      position: { x: 278, y: 214 },
      size: { width: 176, height: 96 },
      status: 'configured',
      properties: [
        { key: 'route', label: 'Route', value: '/login', group: 'general' }
      ]
    },
    {
      id: 'node-page-catalog',
      type: 'page',
      category: 'ui-elements',
      name: 'productCatalogPage',
      label: 'Product Catalog',
      description: 'One-page storefront where the customer browses products.',
      position: { x: 532, y: 214 },
      size: { width: 188, height: 96 },
      status: 'configured',
      properties: [
        { key: 'route', label: 'Route', value: '/catalog', group: 'general' }
      ]
    },
    {
      id: 'node-task-cart',
      type: 'task',
      category: 'workflow',
      name: 'addProductsToCart',
      label: 'Add To Cart',
      description: 'User selects products and adds them to the cart aggregate.',
      position: { x: 804, y: 214 },
      size: { width: 176, height: 96 },
      status: 'configured',
      properties: [
        { key: 'entityRef', label: 'Entity Ref', value: 'entity-node-entity-cart', group: 'binding' }
      ]
    },
    {
      id: 'node-page-checkout',
      type: 'page',
      category: 'ui-elements',
      name: 'checkoutPage',
      label: 'Checkout Page',
      description: 'Checkout page where the user reviews cart and submits payment.',
      position: { x: 1076, y: 214 },
      size: { width: 182, height: 96 },
      status: 'configured',
      properties: [
        { key: 'route', label: 'Route', value: '/checkout', group: 'general' }
      ]
    },
    {
      id: 'node-validation-checkout',
      type: 'validation',
      category: 'logic',
      name: 'checkoutValidation',
      label: 'Checkout Validation',
      description: 'Validates cart content, customer data, and payment preconditions.',
      position: { x: 1354, y: 214 },
      size: { width: 188, height: 96 },
      status: 'configured',
      properties: [
        { key: 'ruleSet', label: 'Rule Set', value: 'CheckoutRules', group: 'behavior' }
      ]
    },
    {
      id: 'node-rest-payment',
      type: 'restCall',
      category: 'integration',
      name: 'paymentGatewayCall',
      label: 'Payment Gateway',
      description: 'Invokes backend payment processing through the payment gateway API.',
      position: { x: 1636, y: 214 },
      size: { width: 186, height: 96 },
      status: 'configured',
      properties: [
        { key: 'endpoint', label: 'Endpoint', value: 'POST /api/payments/checkout', group: 'integration' },
        { key: 'method', label: 'Method', value: 'POST', group: 'integration' }
      ]
    },
    {
      id: 'node-notification-order',
      type: 'notification',
      category: 'workflow',
      name: 'orderConfirmationNotice',
      label: 'Order Confirmation',
      description: 'Sends the final order confirmation after successful payment.',
      position: { x: 1918, y: 214 },
      size: { width: 196, height: 96 },
      status: 'configured',
      properties: [
        { key: 'channel', label: 'Channel', value: 'Email', group: 'behavior' }
      ]
    },
    {
      id: 'node-end-customer',
      type: 'end',
      category: 'workflow',
      name: 'purchaseCompleted',
      label: 'End',
      description: 'Marks the completion of the customer purchase flow.',
      position: { x: 2208, y: 224 },
      size: { width: 146, height: 88 },
      status: 'configured',
      properties: [
        { key: 'result', label: 'Result', value: 'Order placed', group: 'general' }
      ]
    },

    {
      id: 'node-start-admin',
      type: 'start',
      category: 'workflow',
      name: 'startAdministration',
      label: 'Start',
      description: 'Entry point for the sales administration journey.',
      position: { x: 76, y: 438 },
      size: { width: 150, height: 88 },
      status: 'configured',
      properties: [
        { key: 'workflowName', label: 'Workflow Name', value: 'productAdministrationFlow', group: 'general' },
        { key: 'workflowLabel', label: 'Workflow Label', value: 'Product Administration Flow', group: 'general' }
      ]
    },
    {
      id: 'node-page-admin-login',
      type: 'page',
      category: 'ui-elements',
      name: 'adminLoginPage',
      label: 'Admin Login',
      description: 'Sales Manager authentication entry page.',
      position: { x: 278, y: 428 },
      size: { width: 176, height: 96 },
      status: 'configured',
      properties: [
        { key: 'route', label: 'Route', value: '/admin/login', group: 'general' }
      ]
    },
    {
      id: 'node-page-admin-products',
      type: 'page',
      category: 'ui-elements',
      name: 'adminProductPage',
      label: 'Admin Products',
      description: 'Administration page where products, prices, and discounts are maintained.',
      position: { x: 532, y: 428 },
      size: { width: 188, height: 96 },
      status: 'configured',
      properties: [
        { key: 'route', label: 'Route', value: '/admin/products', group: 'general' }
      ]
    },
    {
      id: 'node-task-manage-products',
      type: 'task',
      category: 'workflow',
      name: 'manageProducts',
      label: 'Manage Products',
      description: 'Sales Manager adds or removes products from the catalog.',
      position: { x: 804, y: 428 },
      size: { width: 176, height: 96 },
      status: 'configured',
      properties: [
        { key: 'entityRef', label: 'Entity Ref', value: 'entity-node-entity-product', group: 'binding' }
      ]
    },
    {
      id: 'node-task-pricing',
      type: 'task',
      category: 'workflow',
      name: 'setPricesAndDiscounts',
      label: 'Set Price & Discounts',
      description: 'Sales Manager sets product prices and applies discount rules.',
      position: { x: 1076, y: 428 },
      size: { width: 188, height: 96 },
      status: 'configured',
      properties: [
        { key: 'policyRef', label: 'Policy Ref', value: 'policy-node-policy-discount', group: 'security' }
      ]
    },
    {
      id: 'node-validation-admin',
      type: 'validation',
      category: 'logic',
      name: 'catalogValidation',
      label: 'Catalog Validation',
      description: 'Validates pricing limits and discount policy before publication.',
      position: { x: 1354, y: 428 },
      size: { width: 186, height: 96 },
      status: 'configured',
      properties: [
        { key: 'ruleSet', label: 'Rule Set', value: 'CatalogRules', group: 'behavior' }
      ]
    },
    {
      id: 'node-rest-catalog',
      type: 'restCall',
      category: 'integration',
      name: 'catalogServiceUpdate',
      label: 'Catalog Service',
      description: 'Publishes product changes to the backend catalog service.',
      position: { x: 1636, y: 428 },
      size: { width: 184, height: 96 },
      status: 'configured',
      properties: [
        { key: 'endpoint', label: 'Endpoint', value: 'PUT /api/admin/catalog', group: 'integration' },
        { key: 'method', label: 'Method', value: 'PUT', group: 'integration' }
      ]
    },
    {
      id: 'node-notification-admin',
      type: 'notification',
      category: 'workflow',
      name: 'catalogUpdatedNotice',
      label: 'Catalog Updated',
      description: 'Confirms that product updates have been propagated.',
      position: { x: 1918, y: 428 },
      size: { width: 190, height: 96 },
      status: 'configured',
      properties: [
        { key: 'channel', label: 'Channel', value: 'Internal', group: 'behavior' }
      ]
    },
    {
      id: 'node-end-admin',
      type: 'end',
      category: 'workflow',
      name: 'administrationCompleted',
      label: 'End',
      description: 'Marks the completion of the product administration flow.',
      position: { x: 2208, y: 438 },
      size: { width: 146, height: 88 },
      status: 'configured',
      properties: [
        { key: 'result', label: 'Result', value: 'Catalog published', group: 'general' }
      ]
    }
  ],
  connections: [
    { id: 'conn-customer-1', sourceNodeId: 'node-start-customer', targetNodeId: 'node-page-login', label: 'authenticate' },
    { id: 'conn-customer-2', sourceNodeId: 'node-page-login', targetNodeId: 'node-page-catalog', label: 'browse' },
    { id: 'conn-customer-3', sourceNodeId: 'node-page-catalog', targetNodeId: 'node-task-cart', label: 'select' },
    { id: 'conn-customer-4', sourceNodeId: 'node-task-cart', targetNodeId: 'node-page-checkout', label: 'checkout' },
    { id: 'conn-customer-5', sourceNodeId: 'node-page-checkout', targetNodeId: 'node-validation-checkout', label: 'validate' },
    { id: 'conn-customer-6', sourceNodeId: 'node-validation-checkout', targetNodeId: 'node-rest-payment', label: 'pay' },
    { id: 'conn-customer-7', sourceNodeId: 'node-rest-payment', targetNodeId: 'node-notification-order', label: 'confirm' },
    { id: 'conn-customer-8', sourceNodeId: 'node-notification-order', targetNodeId: 'node-end-customer', label: 'complete' },

    { id: 'conn-admin-1', sourceNodeId: 'node-start-admin', targetNodeId: 'node-page-admin-login', label: 'authenticate' },
    { id: 'conn-admin-2', sourceNodeId: 'node-page-admin-login', targetNodeId: 'node-page-admin-products', label: 'open' },
    { id: 'conn-admin-3', sourceNodeId: 'node-page-admin-products', targetNodeId: 'node-task-manage-products', label: 'manage' },
    { id: 'conn-admin-4', sourceNodeId: 'node-task-manage-products', targetNodeId: 'node-task-pricing', label: 'price' },
    { id: 'conn-admin-5', sourceNodeId: 'node-task-pricing', targetNodeId: 'node-validation-admin', label: 'validate' },
    { id: 'conn-admin-6', sourceNodeId: 'node-validation-admin', targetNodeId: 'node-rest-catalog', label: 'publish' },
    { id: 'conn-admin-7', sourceNodeId: 'node-rest-catalog', targetNodeId: 'node-notification-admin', label: 'notify' },
    { id: 'conn-admin-8', sourceNodeId: 'node-notification-admin', targetNodeId: 'node-end-admin', label: 'complete' }
  ]
};
