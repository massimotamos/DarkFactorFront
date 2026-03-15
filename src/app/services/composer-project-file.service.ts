import { Injectable } from '@angular/core';
import { CanvasConnection, CanvasNode } from '../models/composer.models';

export interface ComposerProjectFile {
  version: 1;
  modelName: string;
  selectedNodeId: string | null;
  canvasNodes: CanvasNode[];
  connections: CanvasConnection[];
}

@Injectable({ providedIn: 'root' })
export class ComposerProjectFileService {
  serialize(project: ComposerProjectFile): string {
    return JSON.stringify(project, null, 2);
  }

  parse(raw: string): ComposerProjectFile {
    const parsed = JSON.parse(raw) as Partial<ComposerProjectFile>;

    if (parsed.version !== 1) {
      throw new Error('Unsupported project file version.');
    }

    if (typeof parsed.modelName !== 'string' || !Array.isArray(parsed.canvasNodes) || !Array.isArray(parsed.connections)) {
      throw new Error('Invalid project file structure.');
    }

    return {
      version: 1,
      modelName: parsed.modelName,
      selectedNodeId: typeof parsed.selectedNodeId === 'string' ? parsed.selectedNodeId : null,
      canvasNodes: parsed.canvasNodes,
      connections: parsed.connections
    };
  }
}
