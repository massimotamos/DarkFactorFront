import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BusinessRuleRecord, EpicRecord, UserStoryRecord } from '../../../../core/models/platform.models';

@Component({
  selector: 'app-backlog-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './backlog-panel.component.html',
  styleUrl: './backlog-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BacklogPanelComponent {
  @Input({ required: true }) epics: EpicRecord[] = [];
  @Input({ required: true }) stories: UserStoryRecord[] = [];
  @Input({ required: true }) businessRules: BusinessRuleRecord[] = [];
  @Input() selectedEpicId: string | null = null;
  @Input() selectedStoryId: string | null = null;
  @Output() epicSelected = new EventEmitter<string>();
  @Output() storySelected = new EventEmitter<string>();
  @Output() epicAdded = new EventEmitter<void>();
  @Output() storyAdded = new EventEmitter<string>();
  @Output() epicUpdated = new EventEmitter<{ epicId: string; patch: Partial<EpicRecord> }>();
  @Output() storyUpdated = new EventEmitter<{ storyId: string; patch: Partial<UserStoryRecord> }>();

  protected storiesForEpic(epicId: string): UserStoryRecord[] {
    return this.stories.filter((story) => story.epicId === epicId);
  }

  protected updateEpic(epicId: string, field: keyof EpicRecord, value: string): void {
    this.epicUpdated.emit({ epicId, patch: { [field]: value } });
  }

  protected updateStory(storyId: string, field: keyof UserStoryRecord, value: string): void {
    this.storyUpdated.emit({ storyId, patch: { [field]: value } });
  }

  protected storyRuleNames(story: UserStoryRecord): string {
    return this.businessRules
      .filter((rule) => story.businessRuleIds.includes(rule.id))
      .map((rule) => rule.name)
      .join(', ') || 'No linked rules';
  }
}
