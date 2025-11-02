import { Component, EventEmitter, Input, Output } from "@angular/core"
import { faArrowLeft } from "@fortawesome/pro-regular-svg-icons"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "app-orders-header",
	templateUrl: "./orders-header.component.html",
	styleUrl: "./orders-header.component.scss",
	standalone: false
})
export class OrdersHeaderComponent {
	actionsLocale = this.localizationService.locale.actions
	faArrowLeft = faArrowLeft

	@Input() headline: string = ""
	@Input() showBackButton: boolean = false
	@Output() backButtonClick = new EventEmitter()

	constructor(private localizationService: LocalizationService) {}
}
