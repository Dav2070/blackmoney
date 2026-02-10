import {
	Component,
	ViewChild,
	ElementRef,
	EventEmitter,
	Output,
	Inject,
	PLATFORM_ID
} from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { faStar } from "@fortawesome/pro-regular-svg-icons"
import { Rating } from "src/app/models/Rating"
import { RatingNum } from "src/app/types"
import { Dialog } from "dav-ui-components"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-add-review-dialog",
	templateUrl: "./add-review-dialog.component.html",
	styleUrl: "./add-review-dialog.component.scss",
	standalone: false
})
export class AddReviewDialogComponent {
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	@Output() reviewSubmitted = new EventEmitter<Rating>()

	visible: boolean = false
	selectedRating: RatingNum = 1
	hoverRating: number = 0
	reviewText: string = ""
	locale = this.localizationService.locale.dialogs.addReviewDialog
	actionsLocale = this.localizationService.locale.actions

	faStar = faStar

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
		this.selectedRating = 1
		this.hoverRating = 0
		this.reviewText = ""
	}

	close() {
		this.visible = false
		this.selectedRating = 1
		this.hoverRating = 0
		this.reviewText = ""
	}

	setRating(rating: number) {
		this.selectedRating = rating as RatingNum
	}

	submit() {
		const rating = new Rating()
		rating.uuid = crypto.randomUUID()
		rating.username = "Aktueller Nutzer" // TODO: Get from session/auth
		rating.value = this.selectedRating
		rating.review = this.reviewText.trim() || undefined
		rating.userUuid = crypto.randomUUID() // TODO: Get from session/auth
		rating.date = new Date()

		this.reviewSubmitted.emit(rating)
		this.close()
	}
}
