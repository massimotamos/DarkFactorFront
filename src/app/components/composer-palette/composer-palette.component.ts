import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaletteCategoryGroup, PaletteItem } from '../../models/composer.models';

@Component({
  selector: 'app-composer-palette',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './composer-palette.component.html',
  styleUrl: './composer-palette.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComposerPaletteComponent {
  @Input({ required: true }) palette: PaletteCategoryGroup[] = [];
  @Output() paletteDragStarted = new EventEmitter<PaletteItem>();

  onDragStart(event: DragEvent, item: PaletteItem): void {
    if (!event.dataTransfer) {
      return;
    }

    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('application/x-composer-palette-item', JSON.stringify(item));
    this.paletteDragStarted.emit(item);
  }
}
