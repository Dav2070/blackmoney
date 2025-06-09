import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

interface DayGroup {
  id: number;
  selectedDays: string[];
}

@Component({
  selector: 'app-opening-days',
  templateUrl: './opening-days.component.html',
  styleUrl: './opening-days.component.scss',
  standalone: false
})
export class OpeningDaysComponent implements OnInit {
  dayList = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  daysForm: FormGroup;
  isChecked = false;
  groups: DayGroup[] = [];
  selectedDaysList: string[] = [];
  groupIdCounter = 1;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.daysForm = this.fb.group({
      days: [[]],
      togetherCheck: [false]
    });
    this.selectedDaysList = [];
    this.isChecked = false;
    this.groups = [];
  }

  changeDays() {
    this.selectedDaysList = this.daysForm.value.days || [];
    // Entferne aus Gruppen alle Tage, die nicht mehr ausgewählt sind
    this.groups.forEach(g => g.selectedDays = g.selectedDays.filter(d => this.selectedDaysList.includes(d)));
    // Entferne leere Gruppen
    this.groups = this.groups.filter(g => g.selectedDays.length > 0);
  }

  changeTogether() {
    this.isChecked = this.daysForm.value.togetherCheck;
    if (!this.isChecked) {
      this.groups = [];
    }
  }

  addGroup() {
    // Füge eine neue Gruppe hinzu, die noch keine Tage enthält
    this.groups.push({ id: this.groupIdCounter++, selectedDays: [] });
  }

  removeGroup(id: number) {
    this.groups = this.groups.filter(g => g.id !== id);
  }

  changeDaysTogether(selected: string[], groupId: number) {
    const group = this.groups.find(g => g.id === groupId);
    if (group) {
      group.selectedDays = selected;
    }
  }

  // Gibt alle Tage zurück, die noch keiner Gruppe zugeordnet sind
  getAvailableDaysForGroup(currentGroup: DayGroup): string[] {
    const daysInOtherGroups = this.groups
      .filter(g => g !== currentGroup)
      .flatMap(g => g.selectedDays);
    return this.selectedDaysList.filter(day =>
      !daysInOtherGroups.includes(day) || currentGroup.selectedDays.includes(day)
    );
  }

  // Validierung: Sind alle ausgewählten Tage genau einer Gruppe zugeordnet?
  isGroupingValid(): boolean {
    if (!this.isChecked) return true;
    const allGrouped = this.groups.flatMap(g => g.selectedDays);
    // Jeder Tag aus selectedDaysList muss genau einmal in den Gruppen vorkommen
    return (
      this.selectedDaysList.length > 0 &&
      this.groups.length > 0 &&
      this.selectedDaysList.every(day => allGrouped.filter(d => d === day).length === 1) &&
      allGrouped.length === this.selectedDaysList.length
    );
  }

  saveDays() {
    if (this.isChecked && !this.isGroupingValid()) {
      window.alert('Bitte ordnen Sie alle ausgewählten Tage eindeutig den Gruppen zu (keine doppelten oder fehlenden Tage).');
      return;
    }
    const days = {
      days: this.selectedDaysList,
      daysTogetherChecked: this.isChecked,
      daysTogether: this.isChecked ? this.groups.map(g => ({ selectedDays: g.selectedDays })) : [],
      restaurantId: 'demo-restaurant'
    };
    console.log('Saved days:', days);
  }
}

