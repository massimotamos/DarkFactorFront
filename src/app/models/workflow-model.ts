/**
 * Workflow Model Interface
 * This defines the structure for workflow data in the MVP
 */

// Node types allowed in MVP
export type NodeType =
    | 'start'
    | 'task'
    | 'decision'
    | 'end';

// Edge types allowed in MVP
export type EdgeType =
    | 'sequence'
    | 'condition';

// Base interfaces
export interface WorkflowNode {
  id: string;
  type: NodeType;
  name: string;
  description?: string;
  position?: {
    x: number;
    y: number;
  };
  properties?: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  type: EdgeType;
  sourceId: string;
  targetId: string;
  condition?: string;
  properties?: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  version?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Validation-related interfaces
export interface NodeValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface EdgeValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface WorkflowValidationResult {
  isValid: boolean;
  errors: string[];
  nodeErrors: Record<string, NodeValidationResult>;
  edgeErrors: Record<string, EdgeValidationResult>;
}

// Serialization-friendly structure
export interface WorkflowJson {
  id: string;
  name: string;
  description?: string;
  version: string;
  nodes: Omit<WorkflowNode, 'id'>[];
  edges: Omit<WorkflowEdge, 'id'>[];
  createdAt?: string;
  updatedAt?: string;
}

// Type guards for validation
export function isValidNodeType(type: any): type is NodeType {
  const validTypes: NodeType[] = ['start', 'task', 'decision', 'end'];
  return validTypes.includes(type);
}

export function isValidEdgeType(type: any): type is EdgeType {
  const validTypes: EdgeType[] = ['sequence', 'condition'];
  return validTypes.includes(type);
}