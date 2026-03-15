import { Injectable } from '@angular/core';
import { Workflow, WorkflowStep } from '../models/workflow.model';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkflowValidationService {

  validateWorkflow(workflow: Workflow): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate workflow name
    if (!workflow.name || workflow.name.trim() === '') {
      errors.push({
        field: 'name',
        message: 'Workflow name is required'
      });
    } else if (workflow.name.length > 100) {
      errors.push({
        field: 'name',
        message: 'Workflow name must be less than 100 characters'
      });
    }

    // Validate workflow steps
    if (!workflow.steps || workflow.steps.length === 0) {
      errors.push({
        field: 'steps',
        message: 'At least one step is required'
      });
    } else {
      const stepValidation = this.validateWorkflowSteps(workflow.steps);
      errors.push(...stepValidation.errors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateWorkflowSteps(steps: WorkflowStep[]): ValidationResult {
    const errors: ValidationError[] = [];

    // Check for duplicate step names
    const stepNames = steps.map(step => step.name);
    const duplicateNames = stepNames.filter((name, index) => stepNames.indexOf(name) !== index);
    if (duplicateNames.length > 0) {
      errors.push({
        field: 'steps',
        message: `Duplicate step names found: ${[...new Set(duplicateNames)].join(', ')}`
      });
    }

    // Validate each step
    steps.forEach((step, index) => {
      const stepErrors = this.validateWorkflowStep(step, index);
      errors.push(...stepErrors.errors);
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateWorkflowStep(step: WorkflowStep, stepIndex: number): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate step name
    if (!step.name || step.name.trim() === '') {
      errors.push({
        field: `steps[${stepIndex}].name`,
        message: 'Step name is required'
      });
    } else if (step.name.length > 100) {
      errors.push({
        field: `steps[${stepIndex}].name`,
        message: 'Step name must be less than 100 characters'
      });
    }

    // Validate step type
    if (!step.type) {
      errors.push({
        field: `steps[${stepIndex}].type`,
        message: 'Step type is required'
      });
    } else if (!['start', 'task', 'end', 'condition', 'action'].includes(step.type)) {
      errors.push({
        field: `steps[${stepIndex}].type`,
        message: 'Invalid step type'
      });
    }

    // Validate nextStepId
    if (step.nextStepId !== undefined && step.nextStepId !== null) {
      if (step.nextStepId < 0) {
        errors.push({
          field: `steps[${stepIndex}].nextStepId`,
          message: 'Next step ID must be non-negative'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}