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



interface TableCombination {
  id: number;
  number: string;
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

tableCombination: TableCombination[] = [];
selectedTable: TableCombination | null = null;
nextTableId = 1;
selectedTableIds: number[] = [];
selectedTables: number[] = [];
selectedChairs: number[] = [];

@Input() loading: boolean = false
@Input() line1: string = ""
roomName: string = ""
@Input() line1Error: string = ""
@Input() line2: number = this.tableCombination.length + 1
@Input() line2Error: string = ""
@Output() clearErrors = new EventEmitter()
@ViewChild("dialog") dialog: ElementRef<Dialog>
@Input() bulkMode = false;
visible: boolean = false;
showAllForm = false;



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
    const tableCombination: TableCombination = {
      id: this.tableCombination.length + 1,
      number: '',
      chairs: this.line2,
      //tableNumber: this.line3,
    };
    this.line1 = '';
    this.nextTableId = this.tableCombination.length +2;
    this.line2 = 4;
    //this.line3 = 1;
    this.tableCombination.push(tableCombination);
    this.showAllForm = true;
    this.visible = false;
  }

  openEditForm(tableCombination: TableCombination) {
      this.selectedTable = tableCombination;
      // Formular mit bestehenden Werten füllen
      this.line1 = tableCombination.number;
      this.line2 = tableCombination.chairs;
      //this.line3 = tableCombination.tableNumber;
      this.showAllForm = false;
      this.visible = true;
    }
  
    updateTableCombination() {
      if (!this.selectedTable) {
        return;
      }
      this.selectedTable.number   = this.line1;
      this.selectedTable.chairs = this.line2;
      //this.selectedTable.tableNumber = this.line3;
  
      // Rücksetzen des Formular-Zustands
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
      this.line2 = 4;
      //this.line3 = 1;
    }

  removeTableCombination(tableCombination: TableCombination){

    // 1) Index des zu entfernenden Tisches ermitteln
    const idx = this.tableCombination.findIndex(t => t.id === tableCombination.id);
    if (idx === -1) return;  // Tisch nicht gefunden
  
    // 2) Nummer des entfernten Tisches sichern
    const removedNumber = this.tableCombination[idx].number;
  
    // 3) löschen
    this.tableCombination.splice(idx, 1);

    this.tableCombination.forEach(t =>{
      if(t.number > removedNumber){
        
      }
    })
    if (this.tableCombination.length === 0){
      
    }
  }

  tmp(){

  }

}
