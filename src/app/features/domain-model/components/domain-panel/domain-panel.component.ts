import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssumptionRecord, ConstraintRecord, DomainModelRecord, RiskRecord } from '../../../../core/models/platform.models';

@Component({
  selector: 'app-domain-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './domain-panel.component.html',
  styleUrl: './domain-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DomainPanelComponent {
  @Input({ required: true }) domainModel!: DomainModelRecord;
  @Input({ required: true }) constraints: ConstraintRecord[] = [];
  @Input({ required: true }) assumptions: AssumptionRecord[] = [];
  @Input({ required: true }) risks: RiskRecord[] = [];
}
