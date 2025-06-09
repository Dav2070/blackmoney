import { Component } from '@angular/core';
import { RestaurantSettings, OpeningDaysGroup } from 'src/app/models/settings-models/restaurant-settings.model';

const ALL_DAYS = [
  'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'
];

@Component({
  selector: 'app-restaurant-overview',
  templateUrl: './restaurant-overview.component.html',
  styleUrls: ['./restaurant-overview.component.scss'],
  standalone: false
})
export class RestaurantOverviewComponent {
  allDays = ALL_DAYS;
  restaurant: RestaurantSettings = {
    name: 'Mein Restaurant',
    openingDaysGroups: [
      { days: ['Montag', 'Dienstag'], periods: [{ from: '09:00', to: '22:00' }] },
      { days: ['Mittwoch'], periods: [{ from: '09:00', to: '14:00' }, { from: '17:00', to: '22:00' }] }
    ]
  };

  editMode = false;
  validationErrors: string[] = [];

  startEdit() {
    this.editMode = true;
  }

  save() {
    this.validationErrors = this.validate();
    if (this.validationErrors.length === 0) {
      this.editMode = false;
    }
  }

  addGroup() {
    this.restaurant.openingDaysGroups.push({ days: [], periods: [{ from: '', to: '' }] });
  }

  removeGroup(i: number) {
    this.restaurant.openingDaysGroups.splice(i, 1);
  }

  setPeriodsType(group: OpeningDaysGroup, type: 'durchgehend' | 'pause') {
    if (type === 'durchgehend') {
      group.periods = [{ from: '', to: '' }];
    } else {
      group.periods = [{ from: '', to: '' }, { from: '', to: '' }];
    }
  }

  isDurchgehend(group: OpeningDaysGroup) {
    return group.periods.length === 1;
  }

  // Gibt die noch nicht vergebenen Tage für die aktuelle Gruppe zurück
  getAvailableDays(currentGroup: OpeningDaysGroup): string[] {
    const selectedDays = this.restaurant.openingDaysGroups
      .filter(g => g !== currentGroup)
      .flatMap(g => g.days);
    return this.allDays.filter(day => !selectedDays.includes(day));
  }

  // Validierung
  validate(): string[] {
    const errors: string[] = [];
    if (!this.restaurant.name.trim()) {
      errors.push('Der Restaurantname darf nicht leer sein.');
    }
    const usedDays = new Set<string>();
    for (const [i, group] of this.restaurant.openingDaysGroups.entries()) {
      if (!group.days.length) {
        errors.push(`Gruppe ${i + 1}: Bitte mindestens einen Tag auswählen.`);
      }
      for (const day of group.days) {
        if (usedDays.has(day)) {
          errors.push(`Der Tag "${day}" ist mehrfach vergeben.`);
        }
        usedDays.add(day);
      }
      for (const [j, period] of group.periods.entries()) {
        if (!period.from || !period.to) {
          errors.push(`Gruppe ${i + 1}, Zeitraum ${j + 1}: Bitte beide Zeiten angeben.`);
        } else if (period.from >= period.to) {
          errors.push(`Gruppe ${i + 1}, Zeitraum ${j + 1}: Die Startzeit muss vor der Endzeit liegen.`);
        }
      }
    }
    return errors;
  }
}