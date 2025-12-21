import {
	Component,
	Input,
	Output,
	EventEmitter,
	ViewChild,
	ElementRef,
	HostListener
} from "@angular/core"
import { Product } from "src/app/models/Product"
import { faPen, faTrash } from "@fortawesome/pro-regular-svg-icons"
import { faEllipsis } from "@fortawesome/free-solid-svg-icons"
import { ContextMenu } from "dav-ui-components"
import { Weekday } from "src/app/types"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-offer-list",
	standalone: false,
	templateUrl: "./offer-list.component.html",
	styleUrl: "./offer-list.component.scss"
})
export class OfferListComponent {
	@Input() offers: Product[] = []
	@Output() editOffer = new EventEmitter<Product>()
	@Output() deleteOffer = new EventEmitter<Product>()

	faPen = faPen
	faTrash = faTrash
	faEllipsis = faEllipsis

	locale = this.localizationService.locale.offerList
	actionsLocale = this.localizationService.locale.actions

	@ViewChild("offerContextMenu")
	offerContextMenu: ElementRef<ContextMenu>
	contextMenuVisible = false
	contextMenuX = 0
	contextMenuY = 0
	selectedOffer: Product | null = null

	constructor(private localizationService: LocalizationService) {}

	showOfferContextMenu(event: Event, offer: Product) {
		const detail = (event as CustomEvent).detail
		this.selectedOffer = offer
		if (this.contextMenuVisible) {
			this.contextMenuVisible = false
			return
		}
		this.contextMenuX = detail.contextMenuPosition.x
		this.contextMenuY = detail.contextMenuPosition.y
		this.contextMenuVisible = true
	}

	@HostListener("document:click", ["$event"])
	handleClickOutside(event: MouseEvent) {
		if (
			this.contextMenuVisible &&
			!this.offerContextMenu?.nativeElement.contains(event.target as Node)
		) {
			this.contextMenuVisible = false
			this.selectedOffer = null
		}
	}

	editSelectedOffer() {
		if (this.selectedOffer) {
			this.editOffer.emit(this.selectedOffer)
		}
		this.contextMenuVisible = false
	}

	deleteSelectedOffer() {
		if (this.selectedOffer) {
			this.deleteOffer.emit(this.selectedOffer)
		}
		this.contextMenuVisible = false
	}

	formatWeekdays(weekdays: Weekday[]): string {
		if (!weekdays || weekdays.length === 0) return ""

		const weekdayMap: { [key: string]: string } = {
			MONDAY: "Mo",
			TUESDAY: "Di",
			WEDNESDAY: "Mi",
			THURSDAY: "Do",
			FRIDAY: "Fr",
			SATURDAY: "Sa",
			SUNDAY: "So"
		}

		const orderedWeekdays = [
			"MONDAY",
			"TUESDAY",
			"WEDNESDAY",
			"THURSDAY",
			"FRIDAY",
			"SATURDAY",
			"SUNDAY"
		]

		const sortedWeekdays = weekdays.sort(
			(a, b) => orderedWeekdays.indexOf(a) - orderedWeekdays.indexOf(b)
		)

		return sortedWeekdays.map(day => weekdayMap[day]).join(", ")
	}

	trackByUuid(index: number, item: { uuid: string }) {
		return item.uuid
	}
}
