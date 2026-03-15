import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-workflow-editor',
  standalone: false,
  templateUrl: './workflow-editor.component.html',
  styleUrls: ['./workflow-editor.component.scss']
})
export class WorkflowEditorComponent implements OnInit {
  workflowForm: FormGroup;
  workflowSteps: any[] = [];
  isEditing = false;
  currentStepIndex: number | null = null;

  constructor(private fb: FormBuilder) {
    this.workflowForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    // Initialize with some sample steps
    this.workflowSteps = [
      { id: 1, name: 'Start', type: 'start', description: 'Workflow start point' },
      { id: 2, name: 'Task 1', type: 'task', description: 'First task in workflow' },
      { id: 3, name: 'Task 2', type: 'task', description: 'Second task in workflow' },
      { id: 4, name: 'End', type: 'end', description: 'Workflow end point' }
    ];
  }

  addStep(): void {
    const newStep = {
      id: this.workflowSteps.length + 1,
      name: `Step ${this.workflowSteps.length + 1}`,
      type: 'task',
      description: 'New workflow step'
    };
    this.workflowSteps.push(newStep);
  }

  editStep(step: any): void {
    this.isEditing = true;
    this.currentStepIndex = this.workflowSteps.findIndex(s => s.id === step.id);
    // In a real implementation, you might populate a form with step data
  }

  saveStep(): void {
    this.isEditing = false;
    this.currentStepIndex = null;
  }

  deleteStep(stepId: number): void {
    this.workflowSteps = this.workflowSteps.filter(step => step.id !== stepId);
  }

  saveWorkflow(): void {
    if (this.workflowForm.valid) {
      console.log('Workflow saved:', this.workflowForm.value);
      console.log('Steps:', this.workflowSteps);
      // Here you would typically save to a backend service
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.currentStepIndex = null;
  }

  trackByStepId(index: number, step: any): number {
    return step.id;
  }
}
