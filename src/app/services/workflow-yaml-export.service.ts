import { Injectable } from '@angular/core';
import * as yaml from 'js-yaml';
import { WorkflowStep } from '../models/workflow-step.model';

export interface WorkflowExportData {
  name: string;
  description: string;
  steps: WorkflowStep[];
}

@Injectable({
  providedIn: 'root'
})
export class WorkflowYamlExportService {

  /**
   * Exports workflow data to YAML format with deterministic field ordering
   * @param workflowData The workflow data to export
   * @returns YAML string representation of the workflow
   */
  exportToYaml(workflowData: WorkflowExportData): string {
    // Create a deterministic representation of the workflow
    const yamlData = {
      name: workflowData.name,
      description: workflowData.description,
      steps: workflowData.steps.map(step => ({
        id: step.id,
        name: step.name,
        type: step.type,
        description: step.description
      }))
    };

    // Serialize to YAML with deterministic ordering
    return yaml.dump(yamlData, {
      indent: 2,
      lineWidth: -1,
      sortKeys: true, // Ensures deterministic field ordering
      noRefs: true, // Ensures stable serialization
      quotingType: '"',
      forceQuotes: true
    });
  }

  /**
   * Exports a single workflow step to YAML format
   * @param step The workflow step to export
   * @returns YAML string representation of the step
   */
  exportStepToYaml(step: WorkflowStep): string {
    const yamlData = {
      id: step.id,
      name: step.name,
      type: step.type,
      description: step.description
    };

    return yaml.dump(yamlData, {
      indent: 2,
      lineWidth: -1,
      sortKeys: true,
      noRefs: true,
      quotingType: '"',
      forceQuotes: true
    });
  }
}