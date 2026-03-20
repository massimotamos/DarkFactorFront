import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationReport } from '../../../../core/models/platform.models';

@Component({
  selector: 'app-validation-summary-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './validation-summary-panel.component.html',
  styleUrl: './validation-summary-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationSummaryPanelComponent {
  @Input({ required: true }) validationReport!: ValidationReport;
}
