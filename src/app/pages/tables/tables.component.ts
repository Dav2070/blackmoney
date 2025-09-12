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


interface Table {
  id: number;
  number: number;
  chairs: number;
  tableNumber: number;

  selected?: boolean;
}

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrl: './tables.component.scss',
  standalone: false
})
export class TablesComponent {

  
    tablesLocale = this.localizationService.locale.tablesPage;
    actionsLocale = this.localizationService.locale.actions;
    locale = this.localizationService.locale.dialogs.addTableDialog;
  
    faPen = faPen
    faFolder = faFolder;
  
    constructor(
      private localizationService: LocalizationService,
      private activatedRoute: ActivatedRoute,
      private router: Router,
      @Inject(PLATFORM_ID) private platformId: object
      
    ) {}
  
  table: Table[] = [];
  selectedTable: Table | null = null;
  nextTableId = 1;
  selectedTableIds: number[] = [];
  selectedTables: number[] = [];
  selectedChairs: number[] = [];
  
  @Input() loading: boolean = false
  @Input() line1: number = 1
  @Input() line1Error: string = ""
  @Input() line2: number = 4
  @Input() line3: number = 1
  @Input() line2Error: string = ""
  @Output() clearErrors = new EventEmitter()
  @ViewChild("dialog") dialog: ElementRef<Dialog>
  visible: boolean = false;

  tmp1: number;
  tmp2: number;
  tmp3: number;
  
  showAllForm = false;
  
  tableIdNumberfieldChange(event: Event) {
      this.line1 = (event as CustomEvent).detail.value
      this.clearErrors.emit()
    }
  
  chairNumberfieldChange(event: Event) {
    this.line2 = (event as CustomEvent).detail.value
    this.clearErrors.emit()
  }

  tableNumberfieldChange(event: Event) {
    this.line3 = (event as CustomEvent).detail.value
    this.clearErrors.emit()
  }

  addTable(){
    const table: Table = {
      id: this.table.length + 1,
      number: this.table.length + 1,
      chairs: this.line2,
      tableNumber: this.line3,
    };
    this.line1 = this.table.length +2;
    this.nextTableId = this.table.length +2;
    this.line2 = 4;
    this.line3 = 1;
    this.table.push(table);
    this.showAllForm = true;
    this.visible = false;
  }

  // Entfern Einen Tisch und passt die Nummer an
  removeTable(tableToRemove: Table){

    // 1) Index des zu entfernenden Tisches ermitteln
    const idx = this.table.findIndex(t => t.id === tableToRemove.id);
    if (idx === -1) return;  // Tisch nicht gefunden
  
    // 2) Nummer des entfernten Tisches sichern
    const removedNumber = this.table[idx].number;
  
    // 3) löschen
    this.table.splice(idx, 1);

    this.table.forEach(t =>{
      if(t.number > removedNumber){
        t.number--;
      }
    })
    if (this.table.length === 0){
      this.line1 = 1;
      this.nextTableId = 1;
      this.selectedTable = null;
    }
  }
  
  // Öffnet das Dialogformular zum Bearbeiten
    openEditForm(table: Table) {
      this.selectedTable = table;
      // Formular mit bestehenden Werten füllen
      this.line1 = table.number;
      this.line2 = table.chairs;
      this.line3 = table.tableNumber;
      this.showAllForm = false;
      this.visible = true;
    }
    // Kombiniert zwei ausgewählte Tische zu einem Tisch
    
    combineTables(combinetable: Table){

      // leert die Auswahl, wenn der gleiche Tisch zwei mal genommen wurde
      if (combinetable === this.selectedTable){
        this.selectedTableIds = [];
        this.selectedChairs =[];
        this.selectedTables = [];
      }

      this.selectedTable = combinetable;
    
      this.line1 = combinetable.number;
      this.line2 = combinetable.chairs;
      this.line3 = combinetable.tableNumber;
      this.tmp1 = 0;
      this.tmp2 = 0;
      this.tmp3 = 0;

      if (combinetable.selected){
        this.selectedTableIds.push(combinetable.number);
        this.selectedChairs.push(combinetable.chairs);
        this.selectedTables.push(combinetable.tableNumber);
      }
      if (this.selectedTableIds.length === 2){

        this.tmp1 = Number(this.selectedChairs[0]) +  Number(this.selectedChairs[1]);
        this.tmp2 = Number(this.selectedTables[0]) + Number(this.selectedTables[1]);

        this.table.forEach(t => {
          if (t.number === this.selectedTableIds[0]){
            this.removeTable(t);
          }
        })
   
        combinetable.number = this.selectedTableIds[0];
        combinetable.chairs = this.tmp1;
        combinetable.tableNumber = this.tmp2;

        this.selectedTableIds = [];
        this.selectedChairs =[];
        this.selectedTables = [];
      }
    }
  
  updateTable() {
      if (!this.selectedTable) {
        return;
      }
      this.selectedTable.number   = this.line1;
      this.selectedTable.chairs = this.line2;
      this.selectedTable.tableNumber = this.line3;
  
      // Rücksetzen des Formular-Zustands
      this.cancelEdit();
    }
  
  submitTable() {
      if (this.selectedTable) {
        this.updateTable();
      } else {
        this.addTable();
      }
    }
  
  cancelEdit() {
      this.showAllForm = true;
      this.visible = false;
      this.line2 = 4;
      this.line3 = 1;
    }

  dupplicateTable(table: Table) {
      this.selectedTable = table;
  
      //this.line1 = table.number;
      this.line2 = table.chairs;
      this.line3 = table.tableNumber;

      this.addTable();
    }

    show() {
      this.visible = true
    }

    hide() {
      this.visible = false;
    }

    bulkMode = false;
    toggleBulkMode(event: Event): void {
      const isChecked = (event.target as HTMLInputElement).checked;
      this.bulkMode = isChecked;
      
    }

    multi(){
      this.addMuliTable(this.line1, this.line3);
    }

    addMuliTable(Anfang: number, Tischanzahl: number){
      const start = Number(Anfang);
      const count = Number(Tischanzahl);
      const Anzahl = start + count;
      for(let i = Anfang; i < Anzahl; i++){
        let table: Table = {
          id: i,
          number: i,
          chairs: this.line2,
          tableNumber: this.line3,
        };
        this.table.push(table);
      }
      this.line1 = this.table.length +2;
      this.nextTableId = this.table.length +2;
      this.line2 = 4;
      this.line3 = 1;
      this.showAllForm = true;
      this.visible = false;
     
  }

showTableCombinationDialog() {

		const currentUrl = this.router.url;
		this.router.navigateByUrl(`${currentUrl}/Combinations`);
	}

    tmp(){

  }

}
