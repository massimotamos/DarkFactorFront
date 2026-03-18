import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ArchitectureInputsRecord,
  CapabilityModelRecord,
  DeployableSolutionInputsRecord,
  NonFunctionalRequirementsRecord,
  ServiceDesignRecord
} from '../../../../core/models/platform.models';

@Component({
  selector: 'app-capability-service-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './capability-service-panel.component.html',
  styleUrl: './capability-service-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CapabilityServicePanelComponent {
  @Input({ required: true }) capabilityModel!: CapabilityModelRecord;
  @Input({ required: true }) serviceDesign!: ServiceDesignRecord;
  @Input({ required: true }) nonFunctionalRequirements!: NonFunctionalRequirementsRecord;
  @Input({ required: true }) architectureInputs!: ArchitectureInputsRecord;
  @Input({ required: true }) deployableSolutionInputs!: DeployableSolutionInputsRecord;
}
