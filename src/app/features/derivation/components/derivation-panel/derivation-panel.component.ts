import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DerivationModel } from '../../../../core/models/platform.models';

@Component({
  selector: 'app-derivation-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './derivation-panel.component.html',
  styleUrl: './derivation-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DerivationPanelComponent {
  @Input({ required: true }) derivationModel!: DerivationModel;
}
