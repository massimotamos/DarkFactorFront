import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformDslDocument, ValidationReport } from '../../../../core/models/platform.models';

@Component({
  selector: 'app-dsl-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dsl-panel.component.html',
  styleUrl: './dsl-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DslPanelComponent {
  @Input({ required: true }) document!: PlatformDslDocument;
  @Input({ required: true }) dslText!: string;
  @Input({ required: true }) validationReport!: ValidationReport;
}
