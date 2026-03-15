import { Injectable } from '@angular/core';
import { CanvasConnection, CanvasNode } from '../models/composer.models';

export interface WorkflowDraft {
  nodes: CanvasNode[];
  connections: CanvasConnection[];
}

@Injectable({ providedIn: 'root' })
export class ApplicationContextDraftService {
  generate(contextNode: CanvasNode): WorkflowDraft {
    const context = contextNode.contextBrief?.context.toLowerCase() ?? '';
    if (context.includes('trade') || context.includes('bank')) {
      return this.generateGenericBusinessDraft(contextNode);
    }

    return this.generateEcommerceDraft(contextNode);
  }

  private generateEcommerceDraft(contextNode: CanvasNode): WorkflowDraft {
    const baseY = contextNode.position.y + 220;
    return {
      nodes: [
        this.node('role.customer', 'role', 'security', 'customer', 'Customer', 'Storefront customer role.', baseY + 0, 80, null, 'Define the customer role for browsing, cart, and checkout.'),
        this.node('role.sales-manager', 'role', 'security', 'salesManager', 'Sales Manager', 'Catalog administration role.', baseY + 220, 80, null, 'Define the sales manager role for catalog maintenance and pricing.'),
        this.node('entity.product', 'entity', 'data', 'product', 'Product', 'Sellable catalog item.', baseY, 360, null, 'Define the product entity with sku, name, price, discount, and availability.'),
        this.node('entity.order', 'entity', 'data', 'order', 'Order', 'Confirmed purchase order.', baseY + 220, 360, null, 'Define the order entity with customer, items, payment status, and fulfillment status.'),
        this.node('view.catalog', 'view', 'experience', 'catalogView', 'Catalog View', 'Storefront product listing screen.', baseY, 664, null, 'Define the catalog view for browsing products and triggering add to cart.'),
        this.node('view.admin-products', 'view', 'experience', 'adminProductsView', 'Admin Products View', 'Product administration screen.', baseY + 220, 664, null, 'Define the admin products view for pricing and discount management.'),
        this.node('task.add-product-to-cart', 'task', 'behavior', 'addProductToCart', 'Add Product To Cart', 'Interaction task for cart updates.', baseY, 980, 'interaction', 'Add the selected product to the active cart and refresh cart state.'),
        this.node('task.process-payment', 'task', 'behavior', 'processPayment', 'Process Payment', 'Business task for checkout charging.', baseY, 1244, 'business', 'Charge the customer, confirm payment, and allow order creation only when payment succeeds.'),
        this.node('task.set-product-discount', 'task', 'behavior', 'setProductDiscount', 'Set Product Discount', 'Business task for changing discount policy.', baseY + 220, 980, 'business', 'Allow a sales manager to update product discount policy and persist the change.'),
        this.node('rule.cart-not-empty', 'rule', 'behavior', 'cartMustNotBeEmpty', 'Cart Must Not Be Empty', 'Validation rule before checkout.', baseY, 1520, 'validation', 'Permit checkout only if the active cart contains at least one product.'),
        this.node('rule.sales-manager-discount', 'rule', 'behavior', 'onlySalesManagerCanSetDiscount', 'Only Sales Manager Can Set Discount', 'Authorization rule for discounts.', baseY + 220, 1520, 'authorization', 'Allow discount updates only when the authenticated user has the Sales Manager role.'),
        this.node('integration.payment-gateway', 'integration', 'integration', 'paymentGateway', 'Payment Gateway', 'External provider for payments.', baseY, 1812, 'payment', 'Use an external payment gateway to authorize and capture checkout payments.'),
        this.node('integration.email-service', 'integration', 'integration', 'emailService', 'Email Service', 'Notification delivery integration.', baseY + 220, 1812, 'notification', 'Send order confirmation and status updates by email.')
      ],
      connections: [
        this.link('link-customer-catalog', 'role.customer', 'view.catalog', 'accesses'),
        this.link('link-sales-admin', 'role.sales-manager', 'view.admin-products', 'accesses'),
        this.link('link-catalog-product', 'view.catalog', 'entity.product', 'displays'),
        this.link('link-admin-product', 'view.admin-products', 'entity.product', 'displays'),
        this.link('link-catalog-add-task', 'view.catalog', 'task.add-product-to-cart', 'triggers'),
        this.link('link-add-product', 'task.add-product-to-cart', 'entity.product', 'updates'),
        this.link('link-payment-order', 'task.process-payment', 'entity.order', 'updates'),
        this.link('link-payment-rule', 'task.process-payment', 'rule.cart-not-empty', 'guards'),
        this.link('link-payment-integration', 'task.process-payment', 'integration.payment-gateway', 'calls'),
        this.link('link-discount-product', 'task.set-product-discount', 'entity.product', 'updates'),
        this.link('link-sales-task', 'role.sales-manager', 'task.set-product-discount', 'executes'),
        this.link('link-discount-rule-task', 'rule.sales-manager-discount', 'task.set-product-discount', 'guards'),
        this.link('link-role-rule', 'role.sales-manager', 'rule.sales-manager-discount', 'constrains'),
        this.link('link-payment-email', 'task.process-payment', 'integration.email-service', 'calls')
      ]
    };
  }

  private generateGenericBusinessDraft(contextNode: CanvasNode): WorkflowDraft {
    const baseY = contextNode.position.y + 220;
    return {
      nodes: [
        this.node('role.primary-user', 'role', 'security', 'primaryUser', 'Primary User', 'Main user role for the application.', baseY, 120, null, 'Define the primary actor of the application.'),
        this.node('entity.main-record', 'entity', 'data', 'mainRecord', 'Main Record', 'Core business entity.', baseY, 420, null, 'Define the central business entity of the application.'),
        this.node('view.main', 'view', 'experience', 'mainView', 'Main View', 'Main user-facing screen.', baseY, 760, null, 'Define the main user-facing view for the application.'),
        this.node('task.process-main-flow', 'task', 'behavior', 'processMainFlow', 'Process Main Flow', 'Primary business task.', baseY, 1080, 'business', 'Execute the primary business workflow for the application.'),
        this.node('rule.main-policy', 'rule', 'behavior', 'mainPolicy', 'Main Policy', 'Primary validation or authorization policy.', baseY, 1400, 'decision', 'Define the main decision or policy constraint for the application.'),
        this.node('integration.external-system', 'integration', 'integration', 'externalSystem', 'External System', 'Primary external dependency.', baseY, 1720, 'external-api', 'Define the main external integration dependency of the application.')
      ],
      connections: [
        this.link('link-role-view', 'role.primary-user', 'view.main', 'accesses'),
        this.link('link-view-task', 'view.main', 'task.process-main-flow', 'triggers'),
        this.link('link-task-entity', 'task.process-main-flow', 'entity.main-record', 'updates'),
        this.link('link-task-rule', 'task.process-main-flow', 'rule.main-policy', 'guards'),
        this.link('link-task-integration', 'task.process-main-flow', 'integration.external-system', 'calls')
      ]
    };
  }

  private node(
    idSuffix: string,
    type: CanvasNode['type'],
    category: CanvasNode['category'],
    name: string,
    label: string,
    description: string,
    y: number,
    x: number,
    semanticKind: string | null,
    prompt: string
  ): CanvasNode {
    return {
      id: `node-${idSuffix}`,
      type,
      category,
      name,
      label,
      description,
      semanticKey: idSuffix,
      semanticKind,
      contextBrief: null,
      prompt,
      validatedSemanticCode: '',
      validationState: 'unvalidated',
      position: { x, y },
      size: { width: 224, height: 110 },
      status: 'draft',
      properties: []
    };
  }

  private link(id: string, sourceKey: string, targetKey: string, label: string): CanvasConnection {
    return {
      id,
      sourceNodeId: `node-${sourceKey}`,
      targetNodeId: `node-${targetKey}`,
      label
    };
  }
}
