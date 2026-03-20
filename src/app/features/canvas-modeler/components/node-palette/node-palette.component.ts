import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NodeTemplate } from '../../../../core/models/platform.models';

@Component({
  selector: 'app-node-palette',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './node-palette.component.html',
  styleUrl: './node-palette.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodePaletteComponent {
  @Input({ required: true }) palette: NodeTemplate[] = [];

  protected onDragStart(event: DragEvent, template: NodeTemplate): void {
    if (!event.dataTransfer) {
      return;
    }

    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('application/x-node-template', JSON.stringify(template));
  }
}
