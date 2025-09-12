import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalizationService } from 'src/app/services/localization-service';
import { faPen, faFolder } from "@fortawesome/pro-regular-svg-icons"
import {
	ElementRef,
	EventEmitter,
	Inject,
	Output,
	PLATFORM_ID,
	ViewChild
} from "@angular/core"
import { isPlatformBrowser, NumberSymbol } from "@angular/common"
import { Dialog } from "dav-ui-components"
import { FormControl } from '@angular/forms';



interface TableCombination {
  id: number;
  number: number[];
  chairs: number;
}

interface Table {
  id: number;
  number: number;
  chairs: number;
}

@Component({
  selector: 'app-table-combination',
  templateUrl: './table-combination.component.html',
  styleUrl: './table-combination.component.scss',
  standalone: false
})

export class TableCombinationComponent {

tablesLocale = this.localizationService.locale.tablesCombinationPage;
actionsLocale = this.localizationService.locale.actions;
locale = this.localizationService.locale.dialogs.addTableCombinationDialog;
  

faPen = faPen
faFolder = faFolder;

table: Table[] = [
  {id: 1, number: 1, chairs: 4},
  {id: 2, number: 2, chairs: 4},
  {id: 3, number: 3, chairs: 6}
]
tableCombination: TableCombination[] = [];
selectedTable: TableCombination | null = null;
nextTableId = 1;
selectedTableIds: number[] = [];
selectedTables: number[] = [];
selectedChairs: number[] = [];
tableCombinations = new FormControl<number[]>([]);

@Input() loading: boolean = false
@Input() line1: number[] = [];
roomName: string = ""
@Input() line1Error: string = ""
@Input() line2: number = this.tableCombination.length + 1
@Input() line2Error: string = ""
@Output() clearErrors = new EventEmitter()
@ViewChild("dialog") dialog: ElementRef<Dialog>
@Input() bulkMode = false;
visible: boolean = false;
showAllForm = false;

combNumber: number[];
combChairs: number;



constructor(
      private localizationService: LocalizationService,
      private activatedRoute: ActivatedRoute,
      private router: Router,
      @Inject(PLATFORM_ID) private platformId: object
      
    ) {}

  tableIdNumberfieldChange(event: Event) {
      this.line1 = (event as CustomEvent).detail.value
      this.clearErrors.emit()
    }
  
  chairNumberfieldChange(event: Event) {
    this.line2 = (event as CustomEvent).detail.value
    this.clearErrors.emit()
  }

  show() {
		this.visible = true
	}

	hide() {
		this.visible = false
	}

  addTableCombination(){
    this.line1 = this.tableCombinations.value ?? []; // Nummer wird gespeichert (1,2,3)
    this.combChairs = 0;
    // addiert die Sitzplätze zusammen
    this.line1.forEach(number =>{
        this.table.forEach(t =>{
          if (number === t.number){
            this.combChairs = this.combChairs + t.chairs;
          }
        })
      }
      
    )
    // fügt die Tischkombination hinzu
    const tableCombination: TableCombination = {
      id: this.tableCombination.length + 1,
      number: this.line1,
      chairs: this.combChairs
    };
    this.tableCombination.push(tableCombination);
    this.cancelEdit();
  }

  openEditForm(tableCombination: TableCombination) {
      this.selectedTable = tableCombination;
      // Formular mit bestehenden Werten füllen
      this.tableCombinations.setValue(tableCombination.number);
      this.line2 = tableCombination.chairs;
      this.showAllForm = false;
      this.visible = true;
    }
  
    updateTableCombination() {
      if (!this.selectedTable) {
        return;
      }
      this.line1 = this.tableCombinations.value ?? []; // Nummer wird gespeichert (1,2,3)
      this.combChairs = 0;
      // addiert die Sitzplätze zusammen
      this.line1.forEach(number =>{
          this.table.forEach(t =>{
            if (number === t.number){
              this.combChairs = this.combChairs + t.chairs;
            }
          })
        } 
      )
      this.selectedTable.number = this.line1;
      this.selectedTable.chairs = this.combChairs;
      this.cancelEdit();
    }

    submitTableCombination() {
      if (this.selectedTable) {
        this.updateTableCombination();
      } else {
        this.addTableCombination();
      }
    }

    cancelEdit() {
      this.showAllForm = true;
      this.visible = false;
      this.line1 = [];
      this.combChairs = 0;
      this.tableCombinations.setValue([]);
    }

  removeTableCombination(tableCombinations: TableCombination){

    const idx = this.tableCombination.findIndex(tc => tc.id === tableCombinations.id);
    if (idx > -1) {
      this.tableCombination.splice(idx, 1);
    }

    if (this.tableCombination.length === 0){
      this.tableCombination = [];
      this.selectedTable = null;
    }
    
    this.cancelEdit();
  }

  tmp(){

  }

}
