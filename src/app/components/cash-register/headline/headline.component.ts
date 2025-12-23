import { Component, EventEmitter, Input, Output } from "@angular/core"
import { faArrowLeft, faCupTogo } from "@fortawesome/pro-regular-svg-icons"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-headline",
	templateUrl: "./headline.component.html",
	styleUrl: "./headline.component.scss",
	standalone: false
})
export class HeadlineComponent {
	actionsLocale = this.localizationService.locale.actions
	faArrowLeft = faArrowLeft
	faCupTogo = faCupTogo

	@Input() headline: string = ""
	@Input() showBackButton: boolean = false
	@Output() backButtonClick = new EventEmitter()

	constructor(private localizationService: LocalizationService) {}
}
