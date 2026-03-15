export interface Workflow {
  id?: number;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkflowStep {
  id?: number;
  name: string;
  type: 'start' | 'task' | 'end' | 'condition' | 'action';
  description?: string;
  properties?: any;
  conditions?: any[];
  nextStepId?: number;
}