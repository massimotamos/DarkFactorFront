import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArchitectureDecisionRecord } from '../../../../core/models/platform.models';

@Component({
  selector: 'app-architecture-decision-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './architecture-decision-panel.component.html',
  styleUrl: './architecture-decision-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArchitectureDecisionPanelComponent {
  @Input({ required: true }) decisions: ArchitectureDecisionRecord[] = [];
}
