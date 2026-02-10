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
import { EditRestaurantNameDialogComponent } from "src/app/dialogs/edit-restaurant-name-dialog/edit-restaurant-name-dialog.component"
import { LocalizationService } from "src/app/services/localization-service"
import * as ErrorCodes from "src/app/errorCodes"
import { Day, SpecialOpeningTime, OpeningTime } from "src/app/models/Day"
import { EditOpeningTimeDialogComponent } from "src/app/dialogs/edit-opening-time-dialog/edit-opening-time-dialog.component"
import { EditSpecialOpeningTimeDialogComponent } from "src/app/dialogs/edit-special-opening-time-dialog/edit-special-opening-time-dialog.component"
import {
	convertOpeningTimeResourceToOpeningTime,
	convertSpecialOpeningTimeResourceToSpecialOpeningTime
} from "src/app/utils"

@Component({
	selector: "app-opening-time-page",
	templateUrl: "./opening-time-page.component.html",
	styleUrl: "./opening-time-page.component.scss",
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
	loading: boolean = true
	openingTimes: OpeningTime[] = []
	Tage: Day[] = []
	sonderTage: SpecialOpeningTime[] = []
	currentEditIndex: number = null

	private weekdayOrder = [
		"MONDAY",
		"TUESDAY",
		"WEDNESDAY",
		"THURSDAY",
		"FRIDAY",
		"SATURDAY",
		"SUNDAY"
	]

	private get weekdayNames(): Record<string, string> {
		const weekdaysLocale = this.localizationService.locale.weekdays
		return {
			MONDAY: weekdaysLocale.monday,
			TUESDAY: weekdaysLocale.tuesday,
			WEDNESDAY: weekdaysLocale.wednesday,
			THURSDAY: weekdaysLocale.thursday,
			FRIDAY: weekdaysLocale.friday,
			SATURDAY: weekdaysLocale.saturday,
			SUNDAY: weekdaysLocale.sunday
		}
	}

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
		await this.dataService.davUserPromiseHolder.AwaitResult()
		await this.loadData()
	}

	async loadData() {
		this.loading = true

		// Load opening times
		const listOpeningTimesResponse = await this.apiService.listOpeningTimes(
			`
				items {
					uuid
					weekday
					durchgehend
					pause
					startTime1
					endTime1
					startTime2
					endTime2
				}
			`,
			{ restaurantUuid: this.uuid }
		)

		if (listOpeningTimesResponse.data?.listOpeningTimes != null) {
			this.openingTimes =
				listOpeningTimesResponse.data.listOpeningTimes.items.map(item =>
					convertOpeningTimeResourceToOpeningTime(item)
				)

			// Convert to Tage format for display
			this.Tage = this.weekdayOrder.map(weekday => {
				const openingTime = this.openingTimes.find(
					ot => ot.weekday === weekday
				)
				if (openingTime) {
					return {
						day: this.weekdayNames[weekday],
						durchgehend: openingTime.durchgehend,
						pause: openingTime.pause,
						geschlossen: false,
						startTime1: openingTime.startTime1,
						endTime1: openingTime.endTime1,
						startTime2: openingTime.startTime2,
						endTime2: openingTime.endTime2
					}
				} else {
					// Keine Öffnungszeit = geschlossen
					return {
						day: this.weekdayNames[weekday],
						durchgehend: false,
						pause: false,
						geschlossen: true,
						startTime1: "",
						endTime1: ""
					}
				}
			})
		}

		// Load special opening times
		const listSpecialOpeningTimesResponse =
			await this.apiService.listSpecialOpeningTimes(
				`
					items {
						uuid
						reason
						from
						to
						durchgehend
						pause
						geschlossen
						startTime1
						endTime1
						startTime2
						endTime2
					}
				`,
				{ restaurantUuid: this.uuid }
			)

		if (
			listSpecialOpeningTimesResponse.data?.listSpecialOpeningTimes != null
		) {
			this.sonderTage =
				listSpecialOpeningTimesResponse.data.listSpecialOpeningTimes.items.map(
					item =>
						convertSpecialOpeningTimeResourceToSpecialOpeningTime(item)
				)
		}

		this.loading = false
	}

	showEditOpeningTimeDialog() {
		this.editOpeningTimeDialog.loading = false

		if (this.Tage.length < 1) {
			this.Tage = this.weekdayOrder.map(weekday => ({
				day: this.weekdayNames[weekday],
				durchgehend: false,
				pause: false,
				geschlossen: true,
				startTime1: "",
				endTime1: ""
			}))
		}

		this.editOpeningTimeDialog.show(this.Tage)
	}

	showEditSpecialOpeningTimeDialog(
		sonderTag: SpecialOpeningTime,
		index: number
	) {
		this.currentEditIndex = index
		this.editSpecialOpeningTimeDialog.loading = false
		this.editSpecialOpeningTimeDialog.show(sonderTag)
	}

	showAddSpecialOpeningTimeDialog() {
		this.currentEditIndex = null
		this.editSpecialOpeningTimeDialog.loading = false
		this.editSpecialOpeningTimeDialog.showNew()
	}

	async editOpeningTimeDialogPrimaryButtonClick(event: { Tage: Day[] }) {
		this.editOpeningTimeDialogLoading = true

		// Convert Tage to OpeningTimeInput format
		// Nur Tage senden, die nicht geschlossen sind
		const openingTimesInput = event.Tage.filter(tag => !tag.geschlossen).map(
			tag => {
				const weekdayIndex = this.weekdayOrder.findIndex(
					wd => this.weekdayNames[wd] === tag.day
				)
				return {
					weekday: this.weekdayOrder[weekdayIndex] as any,
					durchgehend: tag.durchgehend,
					pause: tag.pause,
					startTime1: tag.startTime1,
					endTime1: tag.endTime1,
					startTime2: tag.startTime2,
					endTime2: tag.endTime2
				}
			}
		)

		const updateOpeningTimesResponse =
			await this.apiService.updateOpeningTimes(
				`
					items {
						uuid
						weekday
						durchgehend
						pause
						startTime1
						endTime1
						startTime2
						endTime2
					}
				`,
				{
					restaurantUuid: this.uuid,
					openingTimes: openingTimesInput
				}
			)

		this.editOpeningTimeDialogLoading = false

		if (updateOpeningTimesResponse.data?.updateOpeningTimes != null) {
			this.Tage = event.Tage
			this.editOpeningTimeDialog.hide()
			await this.loadData()
		}
	}

	async editSpecialOpeningTimeDialogPrimaryButtonClick(event: {
		sonderTage: SpecialOpeningTime
	}) {
		this.editSpecialOpeningTimeDialogLoading = true

		if (this.currentEditIndex !== null) {
			// Bearbeiten - Update existing special opening time
			const updateSpecialOpeningTimeResponse =
				await this.apiService.updateSpecialOpeningTime(
					`
						uuid
						reason
						from
						to
						durchgehend
						pause
						geschlossen
						startTime1
						endTime1
						startTime2
						endTime2
					`,
					{
						uuid: this.sonderTage[this.currentEditIndex].uuid,
						reason: event.sonderTage.reason,
						from: event.sonderTage.from,
						to: event.sonderTage.to,
						durchgehend: event.sonderTage.durchgehend,
						pause: event.sonderTage.pause,
						geschlossen: event.sonderTage.geschlossen,
						startTime1: event.sonderTage.startTime1,
						endTime1: event.sonderTage.endTime1,
						startTime2: event.sonderTage.startTime2,
						endTime2: event.sonderTage.endTime2
					}
				)

			if (
				updateSpecialOpeningTimeResponse.data?.updateSpecialOpeningTime !=
				null
			) {
				this.editSpecialOpeningTimeDialog.hide()
				await this.loadData()
			}
		} else {
			// Neu hinzufügen - Create new special opening time
			const createSpecialOpeningTimeResponse =
				await this.apiService.createSpecialOpeningTime(
					`
						uuid
						reason
						from
						to
						durchgehend
						pause
						geschlossen
						startTime1
						endTime1
						startTime2
						endTime2
					`,
					{
						restaurantUuid: this.uuid,
						reason: event.sonderTage.reason,
						from: event.sonderTage.from,
						to: event.sonderTage.to,
						durchgehend: event.sonderTage.durchgehend,
						pause: event.sonderTage.pause ?? false,
						geschlossen: event.sonderTage.geschlossen ?? false,
						startTime1: event.sonderTage.startTime1,
						endTime1: event.sonderTage.endTime1,
						startTime2: event.sonderTage.startTime2,
						endTime2: event.sonderTage.endTime2
					}
				)

			if (
				createSpecialOpeningTimeResponse.data?.createSpecialOpeningTime !=
				null
			) {
				this.editSpecialOpeningTimeDialog.hide()
				await this.loadData()
			}
		}

		this.editSpecialOpeningTimeDialogLoading = false
		this.currentEditIndex = null
	}

	navigateBack() {
		this.router.navigate(["dashboard", "restaurants", this.uuid])
	}
}
