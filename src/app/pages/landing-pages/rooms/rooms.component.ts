import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { i } from 'node_modules/@angular/material/module.d-gWBlTHnh';
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
import { isPlatformBrowser } from "@angular/common"
import { Dialog } from "dav-ui-components"

interface Room {
  id: number;
  name: string;
  number: number;
}

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss',
  standalone: false
})
export class RoomsComponent {

  roomLocale = this.localizationService.locale.roomPage;
  actionsLocale = this.localizationService.locale.actions;
  locale = this.localizationService.locale.dialogs.addRoomDialog;

  faPen = faPen
  faFolder = faFolder;

  constructor(
    private localizationService: LocalizationService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
		
	) {}

rooms: Room[] = [];
selectedRoom: Room | null = null;
nextRoomId = 1;
nextTableId = 1;

@Input() loading: boolean = false
@Input() line1: string = ""
roomName: string = ""
@Input() line1Error: string = ""
@Input() line2: number = this.rooms.length + 1
@Input() line2Error: string = ""
@Output() clearErrors = new EventEmitter()
@ViewChild("dialog") dialog: ElementRef<Dialog>
visible: boolean = false; 

showAllRoomsForm = false;
showAddRoomForm = false;
newRoomName = '';
newRoomNumber = 1;

newTableNumber = 1;
newTableChairs = 4;

showEditTableForm = false;
editTableIndex = 0;
editTableNumber = 1;
editTableChairs = 4;

openAddRoomForm(){
  this.showAddRoomForm = true;
  this.newRoomName = '';
  this.newRoomNumber = this.rooms.length + 1;
}

closeAddRoomForm(){
  this.showAddRoomForm = false;
  this.showAllRoomsForm = true;
}

roomNameTextfieldChange(event: Event) {
		this.line1 = (event as CustomEvent).detail.value
		this.clearErrors.emit()
	}

numberfieldChange(event: Event) {
	this.line2 = (event as CustomEvent).detail.value
	this.clearErrors.emit()
}


addRoom(){
  const room: Room = {
    id: this.nextRoomId++,
    name: this.line1.trim(),
    number: this.line2,
  };
  this.rooms.push(room);
  this.line2++;
  this.line1 = '';
  this.showAddRoomForm = false;
  this.showAllRoomsForm = true;
  this.visible = false;
}

// Öffnet das Dialogformular zum Bearbeiten
  openEditRoomForm(room: Room) {
    this.selectedRoom = room;

    // Formular mit bestehenden Werten füllen
    this.line1 = room.name;
    this.line2 = room.number;

    // Dialog anzeigen, Liste ausblenden
    this.showAllRoomsForm = false;
    this.showAddRoomForm = true;
    this.visible = true;
  }

updateRoom() {
    if (!this.selectedRoom) {
      return;
    }
    this.selectedRoom.name   = this.line1.trim();
    this.selectedRoom.number = this.line2;

    // Rücksetzen des Formular-Zustands
    this.cancelEdit();
  }

submitRoom() {
    if (this.selectedRoom) {
      this.updateRoom();
    } else {
      this.addRoom();
    }
  }

cancelEdit() {
    this.selectedRoom     = null;
    this.showAddRoomForm  = false;
    this.showAllRoomsForm = true;
    this.visible          = false;
  }

	show() {
		this.visible = true
	}

	hide() {
		this.visible = false
	}

  showTableAdministrationDialog(room: Room) {
    // hinzufügen :roomName für URL

    this.roomName = room.name;

		const currentUrl = this.router.url;
		this.router.navigateByUrl(`${currentUrl}/${room.name}/tables`);
	}

  // Entfern Einen Tisch und passt die Nummer an
  removeRoom(roomToRemove: Room){

    // 1) Index des zu entfernenden Tisches ermitteln
    const idx = this.rooms.findIndex(t => t.id === roomToRemove.id);
    if (idx === -1) return;  // Tisch nicht gefunden
  
    // 2) Nummer des entfernten Tisches sichern
    const removedNumber = this.rooms[idx].number;
  
    // 3) löschen
    this.rooms.splice(idx, 1);

    this.rooms.forEach(t =>{
      if(t.number > removedNumber){
        t.number--;
      }
    })
    if (this.rooms.length === 0){
      this.line1 = '';
      this.nextTableId = 1;
      this.selectedRoom = null;
    }
    this.line1 = '';
    this.line2--;
  }


  tmp(){

  }


}