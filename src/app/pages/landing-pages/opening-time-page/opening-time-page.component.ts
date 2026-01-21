import { Component, ViewChild } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import {
	faLocationDot,
	faPen,
	faEllipsis,
	faPrint,
	faSeat
} from "@fortawesome/pro-regular-svg-icons"
import { LocalizationService } from "src/app/services/localization-service"
import * as ErrorCodes from "src/app/errorCodes"
import { Day, SpecialOpeningTime } from "src/app/models/Day"
import { EditOpeningTimeDialogComponent } from "src/app/dialogs/edit-opening-time-dialog/edit-opening-time-dialog.component"
import { EditSpecialOpeningTimeDialogComponent } from "src/app/dialogs/edit-special-opening-time-dialog/edit-special-opening-time-dialog.component"

@Component({
  selector: 'app-opening-time-page',
  templateUrl: './opening-time-page.component.html',
  styleUrl: './opening-time-page.component.scss',
  standalone: false
})

export class OpeningTimePageComponent {

	locale = this.localizationService.locale.openingTimePage
	
	actionsLocale = this.localizationService.locale.actions
	faPen = faPen
	uuid: string = null
	name: string = this.locale.headline
	specialOpeningTime: string = this.locale.specialOpeningTime
	faLocationDot = faLocationDot
	Montag: Day = {day: "Montag", durchgehend: true, pause: false, startTime1: "00:00", endTime1: "00:00"}
	Dienstag: Day = {day: "Dienstag", durchgehend: true, pause: false, startTime1: "00:00", endTime1: "00:00"}
	Mittwoch: Day = {day: "Mittwoch", durchgehend: true, pause: false, startTime1: "00:00", endTime1: "00:00"}
	Donnerstag: Day = {day: "Donnerstag", durchgehend: true, pause: false, startTime1: "00:00", endTime1: "00:00"}
	Freitag: Day = {day: "Freitag", durchgehend: true, pause: false, startTime1: "00:00", endTime1: "00:00"}
	Samstag: Day = {day: "Samstag", durchgehend: true, pause: false, startTime1: "00:00", endTime1: "00:00"}
	Sonntag: Day = {day: "Sonntag", durchgehend: true, pause: false, startTime1: "00:00", endTime1: "00:00"}
	Tage: Day[] = []
	sonderTage: SpecialOpeningTime[] = []
	currentEditIndex: number = null 

	private weekdayOrder = [ 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag' ];
	

	//#region EditOpeningTimeDialog
	@ViewChild("editOpeningTimeDialog")
	editOpeningTimeDialog: EditOpeningTimeDialogComponent
	editOpeningTimeDialogLoading: boolean = false

	//#region EditSpecialOpeningTimeDialog
	@ViewChild("editSpecialOpeningTimeDialog")
	editSpecialOpeningTimeDialog: EditSpecialOpeningTimeDialogComponent
	editSpecialOpeningTimeDialogLoading: boolean = false

  constructor(
		private dataService: DataService,
		private apiService: ApiService,
		private localizationService: LocalizationService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {}

	async ngOnInit() {
		this.uuid = this.activatedRoute.snapshot.paramMap.get("uuid")
	}

	showEditOpeningTimeDialog() {
		this.editOpeningTimeDialog.loading = false

		if(this.Tage.length < 1){
			this.Tage = [
				this.Montag,
				this.Dienstag,
				this.Mittwoch,
				this.Donnerstag,
				this.Freitag,
				this.Samstag,
				this.Sonntag
			]
		}

		this.editOpeningTimeDialog.show(this.Tage)
	}

	showEditSpecialOpeningTimeDialog(sonderTag: SpecialOpeningTime, index: number) { 
		this.currentEditIndex = index 
		this.editSpecialOpeningTimeDialog.loading = false 
		this.editSpecialOpeningTimeDialog.show(sonderTag) 
	}

	showAddSpecialOpeningTimeDialog() { 
		this.currentEditIndex = null 
		this.editSpecialOpeningTimeDialog.loading = false 
		this.editSpecialOpeningTimeDialog.showNew() 
	}

	editOpeningTimeDialogPrimaryButtonClick(event: { Tage: Day[] }) {
		this.Tage = this.editOpeningTimeDialog.Days
		this.editOpeningTimeDialog.hide()
	}

	editSpecialOpeningTimeDialogPrimaryButtonClick(event: { sonderTage: SpecialOpeningTime }) { 
		if (this.currentEditIndex !== null) { // Bearbeiten 
			this.sonderTage[this.currentEditIndex] = event.sonderTage 
		} else { // Neu hinzufügen 
			this.sonderTage = [...this.sonderTage, event.sonderTage] 
		} 
		this.currentEditIndex = null 
		this.editSpecialOpeningTimeDialog.hide() 
	}

	navigateBack() {
		this.router.navigate(["user", "restaurants", this.uuid])
	}
  
}


