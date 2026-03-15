import { ComposerMockModel } from '../models/composer.models';

export const COMPOSER_MOCK_MODEL: ComposerMockModel = {
  palette: [
    {
      id: 'data',
      label: 'Data',
      items: [
        {
          id: 'entity',
          type: 'entity',
          category: 'data',
          label: 'Entity',
          description: 'Backend domain model persisted by Spring Boot.',
          icon: 'E',
          accent: 'accent-data'
        }
      ]
    },
    {
      id: 'ui-elements',
      label: 'Frontend',
      items: [
        {
          id: 'page',
          type: 'page',
          category: 'ui-elements',
          label: 'Page',
          description: 'Angular route or screen.',
          icon: 'P',
          accent: 'accent-ui'
        },
        {
          id: 'action',
          type: 'action',
          category: 'ui-elements',
          label: 'Action',
          description: 'User interaction or page-level command.',
          icon: 'A',
          accent: 'accent-ui'
        }
      ]
    },
    {
      id: 'backend',
      label: 'Backend',
      items: [
        {
          id: 'service',
          type: 'service',
          category: 'backend',
          label: 'Service',
          description: 'Spring Boot application service.',
          icon: 'S',
          accent: 'accent-backend'
        },
        {
          id: 'endpoint',
          type: 'endpoint',
          category: 'backend',
          label: 'Endpoint',
          description: 'REST endpoint exposed by Spring Boot.',
          icon: 'EP',
          accent: 'accent-backend'
        }
      ]
    },
    {
      id: 'logic',
      label: 'Logic',
      items: [
        {
          id: 'condition',
          type: 'condition',
          category: 'logic',
          label: 'Condition',
          description: 'Guard or conditional branch in the application flow.',
          icon: 'C',
          accent: 'accent-logic'
        }
      ]
    }
  ],
  selectedNodeId: 'node-page-catalog',
  canvasNodes: [
    {
      id: 'node-entity-product',
      type: 'entity',
      category: 'data',
      name: 'product',
      label: 'Product',
      description: 'Represents items displayed in the storefront and managed by sales.',
      prompt: 'Create a backend entity Product with fields id, sku, name, price and discount.',
      validatedSemanticCode: `entity product {
  label: "Product"
  intent: "Create a backend entity Product with fields id, sku, name, price and discount."
}`,
      validationState: 'validated',
      position: { x: 72, y: 72 },
      size: { width: 186, height: 98 },
      status: 'configured',
      properties: [
        { key: 'fields', label: 'Fields', value: 'id,sku,name,price,discount', group: 'general' }
      ]
    },
    {
      id: 'node-entity-cart',
      type: 'entity',
      category: 'data',
      name: 'cart',
      label: 'Cart',
      description: 'Holds the customer cart aggregate before checkout.',
      prompt: 'Create a backend entity Cart with fields id, userId, items and totalAmount.',
      validatedSemanticCode: `entity cart {
  label: "Cart"
  intent: "Create a backend entity Cart with fields id, userId, items and totalAmount."
}`,
      validationState: 'validated',
      position: { x: 324, y: 72 },
      size: { width: 176, height: 98 },
      status: 'configured',
      properties: [
        { key: 'fields', label: 'Fields', value: 'id,userId,items,totalAmount', group: 'general' }
      ]
    },
    {
      id: 'node-page-login',
      type: 'page',
      category: 'ui-elements',
      name: 'loginPage',
      label: 'Login Page',
      description: 'Angular login page for customers and sales managers.',
      prompt: 'Create an Angular login page at route /login with email and password fields.',
      validatedSemanticCode: `page loginPage {
  route: "Create an Angular login page at route /login with email and password fields."
  label: "Login Page"
  purpose: "Create an Angular login page at route /login with email and password fields."
}`,
      validationState: 'validated',
      position: { x: 604, y: 72 },
      size: { width: 190, height: 98 },
      status: 'configured',
      properties: [
        { key: 'route', label: 'Route', value: '/login', group: 'general' }
      ]
    },
    {
      id: 'node-page-catalog',
      type: 'page',
      category: 'ui-elements',
      name: 'catalogPage',
      label: 'Catalog Page',
      description: 'Angular product catalog page for storefront customers.',
      prompt: 'Create an Angular catalog page at route /catalog showing product cards and add to cart buttons.',
      validatedSemanticCode: `page catalogPage {
  route: "Create an Angular catalog page at route /catalog showing product cards and add to cart buttons."
  label: "Catalog Page"
  purpose: "Create an Angular catalog page at route /catalog showing product cards and add to cart buttons."
}`,
      validationState: 'validated',
      position: { x: 876, y: 72 },
      size: { width: 196, height: 98 },
      status: 'configured',
      properties: [
        { key: 'route', label: 'Route', value: '/catalog', group: 'general' }
      ]
    },
    {
      id: 'node-action-add-to-cart',
      type: 'action',
      category: 'ui-elements',
      name: 'addToCart',
      label: 'Add To Cart',
      description: 'Frontend action for adding the selected product to the cart.',
      prompt: 'When the user clicks add to cart, call the backend endpoint to append the product to the active cart and refresh cart state.',
      validatedSemanticCode: `action addToCart {
  label: "Add To Cart"
  intent: "When the user clicks add to cart, call the backend endpoint to append the product to the active cart and refresh cart state."
}`,
      validationState: 'validated',
      position: { x: 1160, y: 72 },
      size: { width: 196, height: 98 },
      status: 'configured',
      properties: [
        { key: 'trigger', label: 'Trigger', value: 'Button click', group: 'behavior' }
      ]
    },
    {
      id: 'node-endpoint-cart',
      type: 'endpoint',
      category: 'backend',
      name: 'cartItemsEndpoint',
      label: 'Cart Items Endpoint',
      description: 'REST endpoint for adding a product to the cart.',
      prompt: 'Expose a Spring Boot POST endpoint /api/cart/items that receives productId and quantity and returns the updated cart.',
      validatedSemanticCode: `endpoint cartItemsEndpoint {
  method: "POST"
  path: "Expose a Spring Boot POST endpoint /api/cart/items that receives productId and quantity and returns the updated cart."
  contract: "Expose a Spring Boot POST endpoint /api/cart/items that receives productId and quantity and returns the updated cart."
}`,
      validationState: 'validated',
      position: { x: 1448, y: 72 },
      size: { width: 212, height: 98 },
      status: 'configured',
      properties: [
        { key: 'path', label: 'Path', value: '/api/cart/items', group: 'integration' }
      ]
    },
    {
      id: 'node-service-cart',
      type: 'service',
      category: 'backend',
      name: 'cartService',
      label: 'Cart Service',
      description: 'Spring Boot service handling cart operations.',
      prompt: 'Implement a Spring Boot service that loads the active cart, adds a product item, recalculates totals and persists the cart.',
      validatedSemanticCode: `service cartService {
  layer: "spring-service"
  responsibility: "Implement a Spring Boot service that loads the active cart, adds a product item, recalculates totals and persists the cart."
}`,
      validationState: 'validated',
      position: { x: 1764, y: 72 },
      size: { width: 204, height: 98 },
      status: 'configured',
      properties: [
        { key: 'layer', label: 'Layer', value: 'application', group: 'behavior' }
      ]
    },
    {
      id: 'node-condition-cart-not-empty',
      type: 'condition',
      category: 'logic',
      name: 'cartNotEmpty',
      label: 'Cart Not Empty',
      description: 'Guard ensuring checkout is only available when items are present.',
      prompt: 'Allow checkout only when the current cart contains at least one item.',
      validatedSemanticCode: `condition cartNotEmpty {
  expression: "Allow checkout only when the current cart contains at least one item."
}`,
      validationState: 'validated',
      position: { x: 2068, y: 72 },
      size: { width: 206, height: 98 },
      status: 'configured',
      properties: [
        { key: 'expression', label: 'Expression', value: 'cart.items.size > 0', group: 'behavior' }
      ]
    },

    {
      id: 'node-page-admin',
      type: 'page',
      category: 'ui-elements',
      name: 'adminProductsPage',
      label: 'Admin Products Page',
      description: 'Angular administration page for maintaining products.',
      prompt: 'Create an Angular admin products page at route /admin/products with product list, create form and price update actions.',
      validatedSemanticCode: `page adminProductsPage {
  route: "Create an Angular admin products page at route /admin/products with product list, create form and price update actions."
  label: "Admin Products Page"
  purpose: "Create an Angular admin products page at route /admin/products with product list, create form and price update actions."
}`,
      validationState: 'validated',
      position: { x: 604, y: 292 },
      size: { width: 208, height: 98 },
      status: 'configured',
      properties: [
        { key: 'route', label: 'Route', value: '/admin/products', group: 'general' }
      ]
    },
    {
      id: 'node-action-update-pricing',
      type: 'action',
      category: 'ui-elements',
      name: 'updatePricing',
      label: 'Update Pricing',
      description: 'Frontend action for changing product price and discount.',
      prompt: 'When the sales manager edits a product, submit the new price and discount values to the backend and refresh the product table.',
      validatedSemanticCode: `action updatePricing {
  label: "Update Pricing"
  intent: "When the sales manager edits a product, submit the new price and discount values to the backend and refresh the product table."
}`,
      validationState: 'validated',
      position: { x: 924, y: 292 },
      size: { width: 204, height: 98 },
      status: 'configured',
      properties: [
        { key: 'trigger', label: 'Trigger', value: 'Form submit', group: 'behavior' }
      ]
    },
    {
      id: 'node-endpoint-admin-products',
      type: 'endpoint',
      category: 'backend',
      name: 'adminProductsEndpoint',
      label: 'Admin Products Endpoint',
      description: 'REST endpoint for product maintenance actions.',
      prompt: 'Expose a Spring Boot PUT endpoint /api/admin/products/{id} for updating product price and discount.',
      validatedSemanticCode: `endpoint adminProductsEndpoint {
  method: "PUT"
  path: "Expose a Spring Boot PUT endpoint /api/admin/products/{id} for updating product price and discount."
  contract: "Expose a Spring Boot PUT endpoint /api/admin/products/{id} for updating product price and discount."
}`,
      validationState: 'validated',
      position: { x: 1248, y: 292 },
      size: { width: 212, height: 98 },
      status: 'configured',
      properties: [
        { key: 'path', label: 'Path', value: '/api/admin/products/{id}', group: 'integration' }
      ]
    },
    {
      id: 'node-service-product-admin',
      type: 'service',
      category: 'backend',
      name: 'productAdminService',
      label: 'Product Admin Service',
      description: 'Spring Boot service for product creation, deletion, pricing and discounts.',
      prompt: 'Implement a Spring Boot service that creates, removes and updates products including price and discount changes.',
      validatedSemanticCode: `service productAdminService {
  layer: "spring-service"
  responsibility: "Implement a Spring Boot service that creates, removes and updates products including price and discount changes."
}`,
      validationState: 'validated',
      position: { x: 1568, y: 292 },
      size: { width: 214, height: 98 },
      status: 'configured',
      properties: [
        { key: 'layer', label: 'Layer', value: 'application', group: 'behavior' }
      ]
    },
    {
      id: 'node-condition-manager-role',
      type: 'condition',
      category: 'logic',
      name: 'userIsSalesManager',
      label: 'User Is Sales Manager',
      description: 'Guard ensuring product maintenance actions require the sales manager role.',
      prompt: 'Allow product administration actions only if the authenticated user has the Sales Manager role.',
      validatedSemanticCode: `condition userIsSalesManager {
  expression: "Allow product administration actions only if the authenticated user has the Sales Manager role."
}`,
      validationState: 'validated',
      position: { x: 1898, y: 292 },
      size: { width: 212, height: 98 },
      status: 'configured',
      properties: [
        { key: 'expression', label: 'Expression', value: 'user.roles contains SALES_MANAGER', group: 'behavior' }
      ]
    }
  ],
  connections: [
    { id: 'conn-catalog-product', sourceNodeId: 'node-page-catalog', targetNodeId: 'node-entity-product', label: 'binds' },
    { id: 'conn-login-catalog', sourceNodeId: 'node-page-login', targetNodeId: 'node-page-catalog', label: 'navigates' },
    { id: 'conn-catalog-add', sourceNodeId: 'node-page-catalog', targetNodeId: 'node-action-add-to-cart', label: 'triggers' },
    { id: 'conn-add-endpoint', sourceNodeId: 'node-action-add-to-cart', targetNodeId: 'node-endpoint-cart', label: 'calls' },
    { id: 'conn-endpoint-service', sourceNodeId: 'node-endpoint-cart', targetNodeId: 'node-service-cart', label: 'delegates' },
    { id: 'conn-service-cart', sourceNodeId: 'node-service-cart', targetNodeId: 'node-entity-cart', label: 'persists' },
    { id: 'conn-cart-checkout', sourceNodeId: 'node-entity-cart', targetNodeId: 'node-condition-cart-not-empty', label: 'guards' },

    { id: 'conn-admin-page-product', sourceNodeId: 'node-page-admin', targetNodeId: 'node-entity-product', label: 'manages' },
    { id: 'conn-admin-action', sourceNodeId: 'node-page-admin', targetNodeId: 'node-action-update-pricing', label: 'triggers' },
    { id: 'conn-action-endpoint-admin', sourceNodeId: 'node-action-update-pricing', targetNodeId: 'node-endpoint-admin-products', label: 'calls' },
    { id: 'conn-endpoint-service-admin', sourceNodeId: 'node-endpoint-admin-products', targetNodeId: 'node-service-product-admin', label: 'delegates' },
    { id: 'conn-service-product', sourceNodeId: 'node-service-product-admin', targetNodeId: 'node-entity-product', label: 'updates' },
    { id: 'conn-condition-admin', sourceNodeId: 'node-condition-manager-role', targetNodeId: 'node-action-update-pricing', label: 'authorizes' }
  ]
};
