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
  @Input({ required: true }) dslPreview = '';
  @Input({ required: true }) validationPreview = '';
  @Output() basicPropertyChanged = new EventEmitter<{
    nodeId: string;
    field: 'name' | 'label' | 'description' | 'type';
    value: string;
  }>();

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
}
