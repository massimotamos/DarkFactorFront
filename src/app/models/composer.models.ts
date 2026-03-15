export type PaletteCategory =
  | 'ui-elements'
  | 'logic'
  | 'data'
  | 'workflow'
  | 'security'
  | 'integration';

export interface PaletteItem {
  id: string;
  type: string;
  category: PaletteCategory;
  label: string;
  description: string;
  icon: string;
  accent: string;
}

export interface CanvasNodeProperty {
  key: string;
  label: string;
  value: string;
  group: 'general' | 'binding' | 'behavior' | 'security' | 'integration';
}

export interface CanvasNode {
  id: string;
  type: string;
  category: PaletteCategory;
  name: string;
  label: string;
  description: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  status: 'draft' | 'configured' | 'warning';
  properties: CanvasNodeProperty[];
}

export interface CanvasConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
}

export interface PaletteCategoryGroup {
  id: PaletteCategory;
  label: string;
  items: PaletteItem[];
}

export interface DslNode {
  id: string;
  name: string;
  label: string;
  type: string;
  category: PaletteCategory;
  description: string;
  layout: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  properties: Record<string, string>;
}

export interface DslConnection {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export interface DslExportModel {
  application: {
    name: string;
    nodeCount: number;
    connectionCount: number;
  };
  nodes: DslNode[];
  connections: DslConnection[];
}

export interface ComposerMockModel {
  palette: PaletteCategoryGroup[];
  selectedNodeId: string | null;
  canvasNodes: CanvasNode[];
  connections: CanvasConnection[];
}
