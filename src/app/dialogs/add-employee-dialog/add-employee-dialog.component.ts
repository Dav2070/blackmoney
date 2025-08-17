import {
	Component,
	ElementRef,
	Input,
	Output,
	ViewChild,
	EventEmitter,
	Inject,
	PLATFORM_ID
} from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { Dialog } from "dav-ui-components"
import { Restaurant } from "src/app/models/Restaurant"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-add-employee-dialog",
	templateUrl: "./add-employee-dialog.component.html",
	styleUrl: "./add-employee-dialog.component.scss",
	standalone: false
})
export class AddEmployeeDialogComponent {
	locale = this.localizationService.locale.dialogs.addEmployeeDialog
	actionsLocale = this.localizationService.locale.actions
	name: string = ""
	@Input() nameError: string = ""
	@Input() restaurants: Restaurant[] = []
	@Input() loading: boolean = false
	@Output() primaryButtonClick = new EventEmitter()
	@Output() clearErrors = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	visible: boolean = false
	assignedRestaurants: string[] = []

	constructor(
		private localizationService: LocalizationService,
		@Inject(PLATFORM_ID) private platformId: object
	) {}

	ngAfterViewInit() {
		if (isPlatformBrowser(this.platformId)) {
			document.body.appendChild(this.dialog.nativeElement)
		}
	}

	ngOnDestroy() {
		if (isPlatformBrowser(this.platformId)) {
			document.body.removeChild(this.dialog.nativeElement)
		}
	}

	show() {
		this.visible = true
		this.assignedRestaurants = []
	}

	hide() {
		this.visible = false
	}

	nameTextfieldChange(event: Event) {
		this.name = (event as CustomEvent).detail.value
		this.clearErrors.emit()
	}

	restaurantCheckboxChange(event: Event, restaurantUuid: string) {
		const checked = (event as CustomEvent).detail.checked

		if (checked) {
			this.assignedRestaurants.push(restaurantUuid)
		} else {
			const i = this.assignedRestaurants.indexOf(restaurantUuid)
			if (i != -1) this.assignedRestaurants.splice(i, 1)
		}
	}

	submit() {
		if (this.assignedRestaurants.length === 0) return

		this.primaryButtonClick.emit({
			name: this.name,
			restaurants: this.assignedRestaurants
		})
	}
}
