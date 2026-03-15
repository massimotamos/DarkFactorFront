import { ComposerMockModel } from '../models/composer.models';

export const COMPOSER_MOCK_MODEL: ComposerMockModel = {
  palette: [
    {
      id: 'foundation',
      label: 'Foundation',
      items: [
        {
          id: 'application-context',
          type: 'applicationContext',
          category: 'foundation',
          label: 'Application Context',
          description: 'Project-level brief used to generate the first workflow draft.',
          icon: 'AC',
          accent: 'accent-ui'
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
          description: 'Application actor or access capability.',
          icon: 'R',
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
          description: 'Domain object used across the application model.',
          icon: 'E',
          accent: 'accent-data'
        }
      ]
    },
    {
      id: 'experience',
      label: 'Experience',
      items: [
        {
          id: 'view',
          type: 'view',
          category: 'experience',
          label: 'View',
          description: 'User-facing screen or route.',
          icon: 'V',
          accent: 'accent-ui'
        }
      ]
    },
    {
      id: 'behavior',
      label: 'Behavior',
      items: [
        {
          id: 'task',
          type: 'task',
          category: 'behavior',
          label: 'Task',
          description: 'Business or interaction capability in the application.',
          icon: 'T',
          accent: 'accent-backend'
        },
        {
          id: 'rule',
          type: 'rule',
          category: 'behavior',
          label: 'Rule',
          description: 'Validation, authorization, or decision constraint.',
          icon: 'Ru',
          accent: 'accent-backend'
        }
      ]
    },
    {
      id: 'integration',
      label: 'Integration',
      items: [
        {
          id: 'integration',
          type: 'integration',
          category: 'integration',
          label: 'Integration',
          description: 'External system dependency or channel.',
          icon: 'I',
          accent: 'accent-backend'
        }
      ]
    }
  ],
  selectedNodeId: 'node-application-context',
  canvasNodes: [
    {
      id: 'node-application-context',
      type: 'applicationContext',
      category: 'foundation',
      name: 'ecommerceCommercePlatform',
      label: 'Ecommerce Commerce Platform',
      description: 'Project-level brief for the ecommerce reference application.',
      semanticKey: 'application-context.ecommerce-platform',
      semanticKind: null,
      contextBrief: {
        context: 'Ecommerce web application',
        objective: 'Allow customers to browse products, manage carts, pay online, and allow internal staff to manage catalog and discount policies.',
        constraints: 'Angular frontend, Spring Boot backend, Maven build, role-based access, auditable price and discount changes.',
        safetyConcerns: 'Protect payments, enforce authorization, preserve order integrity, and log administrative changes.'
      },
      prompt: 'Generate a full-stack ecommerce application with customer purchase flow and sales-manager administration flow.',
      validatedSemanticCode: `applicationContext ecommerceCommercePlatform {
  key "application-context.ecommerce-platform"
  label "Ecommerce Commerce Platform"
  description "Project-level brief for the ecommerce reference application."
  context "Ecommerce web application"
  objective "Allow customers to browse products, manage carts, pay online, and allow internal staff to manage catalog and discount policies."
  constraints "Angular frontend, Spring Boot backend, Maven build, role-based access, auditable price and discount changes."
  safety "Protect payments, enforce authorization, preserve order integrity, and log administrative changes."
  prompt "Generate a full-stack ecommerce application with customer purchase flow and sales-manager administration flow."
}`,
      validationState: 'validated',
      position: { x: 72, y: 72 },
      size: { width: 320, height: 144 },
      status: 'configured',
      properties: []
    },
    {
      id: 'node-role-customer',
      type: 'role',
      category: 'security',
      name: 'customer',
      label: 'Customer',
      description: 'Buyer using the ecommerce storefront.',
      semanticKey: 'role.customer',
      semanticKind: null,
      contextBrief: null,
      prompt: 'Define the customer role that can browse products, manage the cart and complete checkout.',
      validatedSemanticCode: `role customer {
  key "role.customer"
  label "Customer"
  description "Buyer using the ecommerce storefront."
  prompt "Define the customer role that can browse products, manage the cart and complete checkout."
}`,
      validationState: 'validated',
      position: { x: 72, y: 340 },
      size: { width: 186, height: 104 },
      status: 'configured',
      properties: [{ key: 'scope', label: 'Scope', value: 'storefront', group: 'security' }]
    },
    {
      id: 'node-role-sales-manager',
      type: 'role',
      category: 'security',
      name: 'salesManager',
      label: 'Sales Manager',
      description: 'Commercial role responsible for pricing and catalog changes.',
      semanticKey: 'role.sales-manager',
      semanticKind: null,
      contextBrief: null,
      prompt: 'Define the sales manager role that can manage products, set prices and apply discounts.',
      validatedSemanticCode: `role salesManager {
  key "role.sales-manager"
  label "Sales Manager"
  description "Commercial role responsible for pricing and catalog changes."
  prompt "Define the sales manager role that can manage products, set prices and apply discounts."
}`,
      validationState: 'validated',
      position: { x: 72, y: 560 },
      size: { width: 198, height: 104 },
      status: 'configured',
      properties: [{ key: 'scope', label: 'Scope', value: 'catalog-admin', group: 'security' }]
    },
    {
      id: 'node-entity-product',
      type: 'entity',
      category: 'data',
      name: 'product',
      label: 'Product',
      description: 'Sellable catalog item with price and discount semantics.',
      semanticKey: 'entity.product',
      semanticKind: null,
      contextBrief: null,
      prompt: 'Define the product entity with sku, name, base price, discount and availability.',
      validatedSemanticCode: `entity product {
  key "entity.product"
  label "Product"
  description "Sellable catalog item with price and discount semantics."
  prompt "Define the product entity with sku, name, base price, discount and availability."
}`,
      validationState: 'validated',
      position: { x: 360, y: 332 },
      size: { width: 204, height: 104 },
      status: 'configured',
      properties: [{ key: 'fields', label: 'Fields', value: 'sku,name,price,discount,availability', group: 'general' }]
    },
    {
      id: 'node-entity-order',
      type: 'entity',
      category: 'data',
      name: 'order',
      label: 'Order',
      description: 'Confirmed customer purchase after successful checkout.',
      semanticKey: 'entity.order',
      semanticKind: null,
      contextBrief: null,
      prompt: 'Define the order entity with customer reference, order items, payment status and fulfillment status.',
      validatedSemanticCode: `entity order {
  key "entity.order"
  label "Order"
  description "Confirmed customer purchase after successful checkout."
  prompt "Define the order entity with customer reference, order items, payment status and fulfillment status."
}`,
      validationState: 'validated',
      position: { x: 360, y: 560 },
      size: { width: 198, height: 104 },
      status: 'configured',
      properties: [{ key: 'fields', label: 'Fields', value: 'customer,items,paymentStatus,fulfillmentStatus', group: 'general' }]
    },
    {
      id: 'node-view-catalog',
      type: 'view',
      category: 'experience',
      name: 'catalogView',
      label: 'Catalog View',
      description: 'Main storefront screen showing available products and add to cart actions.',
      semanticKey: 'view.catalog',
      semanticKind: null,
      contextBrief: null,
      prompt: 'Define the catalog view where customers browse products and trigger add to cart.',
      validatedSemanticCode: `view catalogView {
  key "view.catalog"
  label "Catalog View"
  description "Main storefront screen showing available products and add to cart actions."
  prompt "Define the catalog view where customers browse products and trigger add to cart."
}`,
      validationState: 'validated',
      position: { x: 664, y: 332 },
      size: { width: 212, height: 104 },
      status: 'configured',
      properties: [{ key: 'route', label: 'Route', value: '/catalog', group: 'general' }]
    },
    {
      id: 'node-view-admin-products',
      type: 'view',
      category: 'experience',
      name: 'adminProductsView',
      label: 'Admin Products View',
      description: 'Administration screen for product creation, pricing and discount control.',
      semanticKey: 'view.admin-products',
      semanticKind: null,
      contextBrief: null,
      prompt: 'Define the admin products view where sales managers maintain product prices and discounts.',
      validatedSemanticCode: `view adminProductsView {
  key "view.admin-products"
  label "Admin Products View"
  description "Administration screen for product creation, pricing and discount control."
  prompt "Define the admin products view where sales managers maintain product prices and discounts."
}`,
      validationState: 'validated',
      position: { x: 664, y: 560 },
      size: { width: 222, height: 104 },
      status: 'configured',
      properties: [{ key: 'route', label: 'Route', value: '/admin/products', group: 'general' }]
    },
    {
      id: 'node-task-add-to-cart',
      type: 'task',
      category: 'behavior',
      name: 'addProductToCart',
      label: 'Add Product To Cart',
      description: 'Interaction task that adds the selected product to the active cart.',
      semanticKey: 'task.add-product-to-cart',
      semanticKind: 'interaction',
      contextBrief: null,
      prompt: 'When the customer clicks add to cart, append the selected product to the active cart and refresh the cart summary.',
      validatedSemanticCode: `task addProductToCart {
  kind interaction
  key "task.add-product-to-cart"
  label "Add Product To Cart"
  description "Interaction task that adds the selected product to the active cart."
  prompt "When the customer clicks add to cart, append the selected product to the active cart and refresh the cart summary."
}`,
      validationState: 'validated',
      position: { x: 980, y: 332 },
      size: { width: 224, height: 108 },
      status: 'configured',
      properties: [{ key: 'mode', label: 'Mode', value: 'interaction', group: 'behavior' }]
    },
    {
      id: 'node-task-process-payment',
      type: 'task',
      category: 'behavior',
      name: 'processPayment',
      label: 'Process Payment',
      description: 'Business task responsible for charging the customer during checkout.',
      semanticKey: 'task.process-payment',
      semanticKind: 'business',
      contextBrief: null,
      prompt: 'Charge the customer through the payment provider, confirm success and allow order creation only after successful payment.',
      validatedSemanticCode: `task processPayment {
  kind business
  key "task.process-payment"
  label "Process Payment"
  description "Business task responsible for charging the customer during checkout."
  prompt "Charge the customer through the payment provider, confirm success and allow order creation only after successful payment."
}`,
      validationState: 'validated',
      position: { x: 1244, y: 332 },
      size: { width: 214, height: 108 },
      status: 'configured',
      properties: [{ key: 'mode', label: 'Mode', value: 'business', group: 'behavior' }]
    },
    {
      id: 'node-task-set-discount',
      type: 'task',
      category: 'behavior',
      name: 'setProductDiscount',
      label: 'Set Product Discount',
      description: 'Business task used by catalog administration to update discount policies.',
      semanticKey: 'task.set-product-discount',
      semanticKind: 'business',
      contextBrief: null,
      prompt: 'Allow a sales manager to update the product discount policy and persist the new discount value.',
      validatedSemanticCode: `task setProductDiscount {
  kind business
  key "task.set-product-discount"
  label "Set Product Discount"
  description "Business task used by catalog administration to update discount policies."
  prompt "Allow a sales manager to update the product discount policy and persist the new discount value."
}`,
      validationState: 'validated',
      position: { x: 980, y: 560 },
      size: { width: 224, height: 108 },
      status: 'configured',
      properties: [{ key: 'mode', label: 'Mode', value: 'business', group: 'behavior' }]
    },
    {
      id: 'node-rule-cart-not-empty',
      type: 'rule',
      category: 'behavior',
      name: 'cartMustNotBeEmpty',
      label: 'Cart Must Not Be Empty',
      description: 'Validation rule ensuring checkout only continues when the cart has items.',
      semanticKey: 'rule.cart-not-empty',
      semanticKind: 'validation',
      contextBrief: null,
      prompt: 'Permit checkout only if the active cart contains at least one product.',
      validatedSemanticCode: `rule cartMustNotBeEmpty {
  kind validation
  key "rule.cart-not-empty"
  label "Cart Must Not Be Empty"
  description "Validation rule ensuring checkout only continues when the cart has items."
  prompt "Permit checkout only if the active cart contains at least one product."
}`,
      validationState: 'validated',
      position: { x: 1520, y: 332 },
      size: { width: 228, height: 108 },
      status: 'configured',
      properties: [{ key: 'kind', label: 'Kind', value: 'validation', group: 'behavior' }]
    },
    {
      id: 'node-rule-sales-manager-discount',
      type: 'rule',
      category: 'behavior',
      name: 'onlySalesManagerCanSetDiscount',
      label: 'Only Sales Manager Can Set Discount',
      description: 'Authorization rule protecting discount maintenance actions.',
      semanticKey: 'rule.sales-manager-discount',
      semanticKind: 'authorization',
      contextBrief: null,
      prompt: 'Allow the discount update task only when the authenticated user has the Sales Manager role.',
      validatedSemanticCode: `rule onlySalesManagerCanSetDiscount {
  kind authorization
  key "rule.sales-manager-discount"
  label "Only Sales Manager Can Set Discount"
  description "Authorization rule protecting discount maintenance actions."
  prompt "Allow the discount update task only when the authenticated user has the Sales Manager role."
}`,
      validationState: 'validated',
      position: { x: 1520, y: 560 },
      size: { width: 238, height: 108 },
      status: 'configured',
      properties: [{ key: 'kind', label: 'Kind', value: 'authorization', group: 'behavior' }]
    },
    {
      id: 'node-integration-payment-gateway',
      type: 'integration',
      category: 'integration',
      name: 'paymentGateway',
      label: 'Payment Gateway',
      description: 'External payment provider used during checkout.',
      semanticKey: 'integration.payment-gateway',
      semanticKind: 'payment',
      contextBrief: null,
      prompt: 'Use an external payment gateway to authorize and capture the checkout payment.',
      validatedSemanticCode: `integration paymentGateway {
  kind payment
  key "integration.payment-gateway"
  label "Payment Gateway"
  description "External payment provider used during checkout."
  prompt "Use an external payment gateway to authorize and capture the checkout payment."
}`,
      validationState: 'validated',
      position: { x: 1812, y: 332 },
      size: { width: 212, height: 108 },
      status: 'configured',
      properties: [{ key: 'provider', label: 'Provider', value: 'payment', group: 'integration' }]
    },
    {
      id: 'node-integration-email-service',
      type: 'integration',
      category: 'integration',
      name: 'emailService',
      label: 'Email Service',
      description: 'Notification integration for confirmations and status updates.',
      semanticKey: 'integration.email-service',
      semanticKind: 'notification',
      contextBrief: null,
      prompt: 'Send order confirmation and status notification emails to the customer.',
      validatedSemanticCode: `integration emailService {
  kind notification
  key "integration.email-service"
  label "Email Service"
  description "Notification integration for confirmations and status updates."
  prompt "Send order confirmation and status notification emails to the customer."
}`,
      validationState: 'validated',
      position: { x: 1812, y: 560 },
      size: { width: 212, height: 108 },
      status: 'configured',
      properties: [{ key: 'provider', label: 'Provider', value: 'notification', group: 'integration' }]
    }
  ],
  connections: [
    { id: 'link-customer-catalog', sourceNodeId: 'node-role-customer', targetNodeId: 'node-view-catalog', label: 'accesses' },
    { id: 'link-sales-admin', sourceNodeId: 'node-role-sales-manager', targetNodeId: 'node-view-admin-products', label: 'accesses' },
    { id: 'link-catalog-product', sourceNodeId: 'node-view-catalog', targetNodeId: 'node-entity-product', label: 'displays' },
    { id: 'link-admin-product', sourceNodeId: 'node-view-admin-products', targetNodeId: 'node-entity-product', label: 'displays' },
    { id: 'link-catalog-add-task', sourceNodeId: 'node-view-catalog', targetNodeId: 'node-task-add-to-cart', label: 'triggers' },
    { id: 'link-add-product', sourceNodeId: 'node-task-add-to-cart', targetNodeId: 'node-entity-product', label: 'updates' },
    { id: 'link-payment-order', sourceNodeId: 'node-task-process-payment', targetNodeId: 'node-entity-order', label: 'updates' },
    { id: 'link-payment-rule', sourceNodeId: 'node-task-process-payment', targetNodeId: 'node-rule-cart-not-empty', label: 'guards' },
    { id: 'link-payment-integration', sourceNodeId: 'node-task-process-payment', targetNodeId: 'node-integration-payment-gateway', label: 'calls' },
    { id: 'link-discount-product', sourceNodeId: 'node-task-set-discount', targetNodeId: 'node-entity-product', label: 'updates' },
    { id: 'link-sales-task', sourceNodeId: 'node-role-sales-manager', targetNodeId: 'node-task-set-discount', label: 'executes' },
    { id: 'link-discount-rule-task', sourceNodeId: 'node-rule-sales-manager-discount', targetNodeId: 'node-task-set-discount', label: 'guards' },
    { id: 'link-role-rule', sourceNodeId: 'node-role-sales-manager', targetNodeId: 'node-rule-sales-manager-discount', label: 'constrains' },
    { id: 'link-payment-email', sourceNodeId: 'node-task-process-payment', targetNodeId: 'node-integration-email-service', label: 'calls' }
  ]
};
