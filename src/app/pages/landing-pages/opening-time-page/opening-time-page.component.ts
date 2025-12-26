import { Component, ViewChild } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { ApiService } from "src/app/services/api-service"
import { DataService } from "src/app/services/data-service"
import {
	faLocationDot,
	faPen,
	faPrint,
	faSeat
} from "@fortawesome/pro-regular-svg-icons"
import { EditRestaurantNameDialogComponent } from "src/app/dialogs/edit-restaurant-name-dialog/edit-restaurant-name-dialog.component"
import { EditAddressDialogComponent } from "src/app/dialogs/edit-address-dialog/edit-address-dialog.component"
import { LocalizationService } from "src/app/services/localization-service"
import * as ErrorCodes from "src/app/errorCodes"
import { EditContactInfoDialogComponent } from "src/app/dialogs/edit-contact-info-dialog/edit-contact-info-dialog.component"
import { Day } from "src/app/models/Day"
import { EditOpeningTimeDialogComponent } from "src/app/dialogs/edit-opening-time-dialog/edit-opening-time-dialog.component"

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
	sonderTage: Day[] = []

	DayError: String = ""
	line1: string = ""
	line1Error: string = ""
	line2: string = ""
	line2Error: string = ""

	private weekdayOrder = [ 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag' ];
	

	//#region EditOpeningTimeDialog
	@ViewChild("editOpeningTimeDialog")
	editOpeningTimeDialog: EditOpeningTimeDialogComponent
	editOpeningTimeDialogLoading: boolean = false

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

	tmp() {
		
	}

	showEditOpeningTimeDialog() {
		this.editOpeningTimeDialog.loading = false

		console.log("Show")

		if(this.Tage.length < 1){
			console.log("< 1")
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
		console.log("Ende von Show")
	}

	editOpeningTimeDialogPrimaryButtonClick(event: { Tage: Day[] }) {
		this.Tage = this.editOpeningTimeDialog.Days
		this.editOpeningTimeDialog.hide()
	}

	navigateBack() {
		this.router.navigate(["user", "restaurants", this.uuid])
	}
  
}
