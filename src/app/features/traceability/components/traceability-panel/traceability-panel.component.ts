import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TraceabilityLinkRecord, ValidationReport } from '../../../../core/models/platform.models';

@Component({
  selector: 'app-traceability-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './traceability-panel.component.html',
  styleUrl: './traceability-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraceabilityPanelComponent {
  @Input({ required: true }) relationships: TraceabilityLinkRecord[] = [];
  @Input({ required: true }) validationReport!: ValidationReport;
}
