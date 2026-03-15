import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-composer-toolbar',
  standalone: true,
  templateUrl: './composer-toolbar.component.html',
  styleUrl: './composer-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComposerToolbarComponent {
  @Input({ required: true }) modelName = '';
  @Input({ required: true }) nodeCount = 0;
  @Output() validateProjectRequested = new EventEmitter<void>();
  @Output() saveProjectRequested = new EventEmitter<void>();
  @Output() loadProjectRequested = new EventEmitter<void>();
  @Output() previewDslRequested = new EventEmitter<void>();

  onValidateProjectClick(): void {
    this.validateProjectRequested.emit();
  }

  onSaveProjectClick(): void {
    this.saveProjectRequested.emit();
  }

  onLoadProjectClick(): void {
    this.loadProjectRequested.emit();
  }

  onPreviewDslClick(): void {
    this.previewDslRequested.emit();
  }
}
