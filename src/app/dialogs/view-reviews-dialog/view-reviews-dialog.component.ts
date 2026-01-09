import {
	Component,
	Input,
	ViewChild,
	ElementRef,
	Inject,
	PLATFORM_ID
} from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { Dialog } from "dav-ui-components"
import { Rating } from "src/app/models/Rating"
import { ReviewFilterType } from "src/app/types"
import {
	faStar,
	faClock,
	faArrowDown,
	faArrowUp
} from "@fortawesome/pro-regular-svg-icons"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-view-reviews-dialog",
	templateUrl: "./view-reviews-dialog.component.html",
	styleUrl: "./view-reviews-dialog.component.scss",
	standalone: false
})
export class ViewReviewsDialogComponent {
	@Input() ratings: Rating[] = []
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	visible: boolean = false
	filterType: ReviewFilterType = "newest"
	locale = this.localizationService.locale.dialogs.viewReviewsDialog

	faStar = faStar
	faClock = faClock
	faArrowDown = faArrowDown
	faArrowUp = faArrowUp

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

	open() {
		this.visible = true
	}

	close() {
		this.visible = false
	}

	calculateAverageRating(): number {
		if (!this.ratings || this.ratings.length === 0) {
			return 0
		}
		const sum = this.ratings.reduce((acc, rating) => acc + rating.value, 0)
		return sum / this.ratings.length
	}

	setFilter(type: ReviewFilterType) {
		this.filterType = type
	}

	getFilteredRatings(): Rating[] {
		if (!this.ratings || this.ratings.length === 0) {
			return []
		}

		const sortedRatings = [...this.ratings]

		switch (this.filterType) {
			case "lowest":
				return sortedRatings.sort((a, b) => a.value - b.value)
			case "highest":
				return sortedRatings.sort((a, b) => b.value - a.value)
			case "newest":
			default:
				// TODO: Sort by date when available from backend
				return sortedRatings
		}
	}
}
