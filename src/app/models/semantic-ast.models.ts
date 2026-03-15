import { ComposerNodeType } from './composer.models';

export interface SemanticNodeAst {
  id: string;
  type: ComposerNodeType;
  name: string;
  key: string;
  kind: string | null;
  label: string;
  description: string;
  layout: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  contextBrief?: {
    context: string;
    objective: string;
    constraints: string;
    safetyConcerns: string;
  } | null;
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
  applicationContexts: SemanticNodeAst[];
  roles: SemanticNodeAst[];
  entities: SemanticNodeAst[];
  views: SemanticNodeAst[];
  tasks: SemanticNodeAst[];
  rules: SemanticNodeAst[];
  integrations: SemanticNodeAst[];
  links: SemanticLinkAst[];
}

export interface AstValidationIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  elementId?: string;
}

export interface ProjectValidationResult {
  status: 'valid' | 'warning' | 'invalid';
  syntaxIssues: AstValidationIssue[];
  semanticIssues: AstValidationIssue[];
  generationIssues: AstValidationIssue[];
}
