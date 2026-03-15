import { ComposerNodeType } from './composer.models';

export interface SemanticNodeAst {
  id: string;
  type: ComposerNodeType;
  name: string;
  label: string;
  description: string;
  prompt: string;
  semanticCode: string;
}

export interface SemanticLinkAst {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export interface FullStackApplicationAst {
  kind: 'FullStackApplicationAst';
  targetStack: {
    frontend: 'Angular';
    backend: 'SpringBoot';
    build: 'Maven';
  };
  application: {
    name: string;
    nodeCount: number;
    connectionCount: number;
  };
  entities: SemanticNodeAst[];
  pages: SemanticNodeAst[];
  services: SemanticNodeAst[];
  endpoints: SemanticNodeAst[];
  actions: SemanticNodeAst[];
  conditions: SemanticNodeAst[];
  links: SemanticLinkAst[];
}

export interface AstValidationIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  elementId?: string;
}
