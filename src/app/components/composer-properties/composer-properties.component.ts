import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasNode } from '../../models/composer.models';

@Component({
  selector: 'app-composer-properties',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './composer-properties.component.html',
  styleUrl: './composer-properties.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComposerPropertiesComponent {
  @Input() selectedNode: CanvasNode | null = null;
  @Output() basicPropertyChanged = new EventEmitter<{
    nodeId: string;
    field: 'name' | 'label' | 'description' | 'type';
    value: string;
  }>();
  @Output() promptChanged = new EventEmitter<{
    nodeId: string;
    value: string;
  }>();
  @Output() validateRequested = new EventEmitter<string>();

  onBasicFieldInput(
    field: 'name' | 'label' | 'description' | 'type',
    event: Event
  ): void {
    if (!this.selectedNode) {
      return;
    }

    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.basicPropertyChanged.emit({
      nodeId: this.selectedNode.id,
      field,
      value
    });
  }

  onPromptInput(event: Event): void {
    if (!this.selectedNode) {
      return;
    }

    this.promptChanged.emit({
      nodeId: this.selectedNode.id,
      value: (event.target as HTMLTextAreaElement).value
    });
  }

  onValidateClick(): void {
    if (!this.selectedNode) {
      return;
    }

    this.validateRequested.emit(this.selectedNode.id);
  }
}
