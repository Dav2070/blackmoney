import { Component } from '@angular/core';
import { RestaurantSettings, OpeningDaysGroup } from 'src/app/models/settings-models/restaurant-settings.model';
import { TSE, TSEClient } from 'src/app/models/settings-models/tse.model';

@Component({
  selector: 'app-restaurant-overview',
  templateUrl: './restaurant-overview.component.html',
  styleUrls: ['./restaurant-overview.component.scss'],
  standalone: false
})

export class RestaurantOverviewComponent {
  readonly WEEKDAYS = [
    'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'
  ];


  allDays = this.WEEKDAYS;
  restaurants: RestaurantSettings[] = [
    {
      name: 'Mein Restaurant',
      adresse: { strasse: '', plz: '', ort: '', land: '' },
      telefonnummer: '',
      email: '',
      steuerId: '',
      inhaber: '',
      openingDaysGroups: [
        { days: ['Montag', 'Dienstag'], periods: [{ from: '09:00', to: '22:00' }] },
        { days: ['Mittwoch'], periods: [{ from: '09:00', to: '14:00' }, { from: '17:00', to: '22:00' }] }
      ],
      tses: [
        {
          id: 1,
          name: 'TSE Hauptkasse',
          status: 'aktiv',
          pin: '123456',
          clients: [
            { id: 1, name: 'Kasse 1', seriennummer: 'SN-123456' }
          ]
        }
      ]
    },
    {
      name: 'Filiale 2',
      adresse: { strasse: 'Nebenstr. 2', plz: '54321', ort: 'Nebenstadt', land: 'DE' },
      telefonnummer: '01234 567890',
      email: 'filiale2@beispiel.de',
      steuerId: '987654321',
      inhaber: 'Max Mustermann',
      openingDaysGroups: [
        { days: ['Donnerstag', 'Freitag'], periods: [{ from: '10:00', to: '20:00' }] }
      ],
      tses: []
    }
  ];

  selectedRestaurantIndex = 0;

  get restaurant(): RestaurantSettings {
    return this.restaurants[this.selectedRestaurantIndex];
  }

  editMode = false;
  tseEditMode = false;
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
    const allDays = this.allDays;

    const toMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const dayIndex = (day: string) => allDays.indexOf(day);

    // 1. Alle Zeiträume pro Tag sammeln
    const dayPeriods: { [day: string]: { from: number, to: number, group: number }[] } = {};

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
        } else if (period.from === period.to) {
          errors.push(`Gruppe ${i + 1}, Zeitraum ${j + 1}: Die Startzeit darf nicht gleich der Endzeit sein.`);
        }
      }
      // Zeiträume für jeden Tag eintragen
      for (const day of group.days) {
        if (!dayPeriods[day]) dayPeriods[day] = [];
        for (const period of group.periods) {
          const start = toMinutes(period.from);
          const end = toMinutes(period.to);
          if (start < end) {
            // Normaler Zeitraum, bleibt am selben Tag
            dayPeriods[day].push({ from: start, to: end, group: i });
          } else {
            // Über Mitternacht: splitte auf aktuellen und Folgetag
            // Aktueller Tag: start bis 24:00
            dayPeriods[day].push({ from: start, to: 24 * 60, group: i });
            // Folgetag: 00:00 bis end
            const nextDayIdx = (dayIndex(day) + 1) % 7;
            const nextDay = allDays[nextDayIdx];
            if (!dayPeriods[nextDay]) dayPeriods[nextDay] = [];
            dayPeriods[nextDay].push({ from: 0, to: end, group: i });
          }
        }
      }
    }

    // 2. Überschneidungen pro Tag prüfen (auch gruppenübergreifend)
    for (const day of allDays) {
      const periods = dayPeriods[day] || [];
      for (let i = 0; i < periods.length; i++) {
        for (let j = i + 1; j < periods.length; j++) {
          const a = periods[i];
          const b = periods[j];
          // Zeiträume aus derselben Gruppe und identisch überspringen
          if (a.group === b.group && a.from === b.from && a.to === b.to) continue;
          if (a.from < b.to && b.from < a.to) {
            errors.push(
              `Überschneidung: ${day} (${a.from
                .toString()
                .padStart(4, '0')
                .replace(/(\d{2})(\d{2})/, '$1:$2')}-${a.to
                  .toString()
                  .padStart(4, '0')
                  .replace(/(\d{2})(\d{2})/, '$1:$2')}) überschneidet sich mit (${b.from
                    .toString()
                    .padStart(4, '0')
                    .replace(/(\d{2})(\d{2})/, '$1:$2')}-${b.to
                      .toString()
                      .padStart(4, '0')
                      .replace(/(\d{2})(\d{2})/, '$1:$2')})`
            );
          }
        }
      }
    }

    return errors;
  }

  getOpeningHoursPerDay(): { day: string, periods: { from: string, to: string }[] }[] {
    if (!this.restaurant?.openingDaysGroups) return [];
    const result: { day: string, periods: { from: string, to: string }[] }[] = [];
    for (const day of this.WEEKDAYS) {
      // Finde alle Gruppen, die diesen Tag enthalten
      const group = this.restaurant.openingDaysGroups.find(g => g.days.includes(day));
      result.push({
        day,
        periods: group ? group.periods : []
      });
    }
    return result;
  }

  get tses(): TSE[] {
    return this.restaurant.tses ?? [];
  }

  addTSE() {
    const tses = this.restaurant.tses ?? (this.restaurant.tses = []);
    const nextId = tses.length ? Math.max(...tses.map(t => t.id)) + 1 : 1;
    tses.push({
      id: nextId,
      name: 'Neue TSE',
      status: 'inaktiv',
      pin: '',
      clients: []
    });
  }

  deleteTSE(tse: TSE) {
    const tses = this.restaurant.tses ?? [];
    const idx = tses.indexOf(tse);
    if (idx > -1) tses.splice(idx, 1);
  }

  addClient(tse: TSE) {
    const nextId = tse.clients.length ? Math.max(...tse.clients.map(c => c.id)) + 1 : 1;
    tse.clients.push({
      id: nextId,
      name: 'Neuer Client',
      seriennummer: ''
    });
  }

  deleteClient(tse: TSE, client: TSEClient) {
    const idx = tse.clients.indexOf(client);
    if (idx > -1) tse.clients.splice(idx, 1);
  }

  addRestaurant() {
    this.restaurants.push({
      name: 'Neues Restaurant',
      adresse: { strasse: '', plz: '', ort: '', land: '' },
      telefonnummer: '',
      email: '',
      steuerId: '',
      inhaber: '',
      openingDaysGroups: []
    });
    this.selectedRestaurantIndex = this.restaurants.length - 1;
  }
}