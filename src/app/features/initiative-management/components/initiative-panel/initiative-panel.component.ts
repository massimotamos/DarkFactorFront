import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BusinessContextRecord, InitiativeRecord } from '../../../../core/models/platform.models';

@Component({
  selector: 'app-initiative-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './initiative-panel.component.html',
  styleUrl: './initiative-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InitiativePanelComponent {
  @Input({ required: true }) initiative!: InitiativeRecord;
  @Input({ required: true }) businessContext!: BusinessContextRecord;
  @Output() initiativeChanged = new EventEmitter<Partial<InitiativeRecord>>();
  @Output() businessContextChanged = new EventEmitter<Partial<BusinessContextRecord>>();

  protected updateInitiative(field: keyof InitiativeRecord, value: string): void {
    const patch = field === 'targetOutcomes'
      ? { [field]: value.split('\n').map((entry) => entry.trim()).filter(Boolean) }
      : { [field]: value };
    this.initiativeChanged.emit(patch);
  }

  protected updateBusinessContext(field: keyof BusinessContextRecord, value: string): void {
    const patch = field === 'stakeholders' || field === 'regulatoryContext' || field === 'expectedOutcomes'
      ? { [field]: value.split('\n').map((entry) => entry.trim()).filter(Boolean) }
      : { [field]: value };
    this.businessContextChanged.emit(patch);
  }
}
