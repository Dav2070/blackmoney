import { Component, EventEmitter, Input, Output } from "@angular/core"
import { faArrowLeft } from "@fortawesome/pro-regular-svg-icons"

@Component({
	selector: "app-orders-header",
	templateUrl: "./orders-header.component.html",
	styleUrl: "./orders-header.component.scss",
	standalone: false
})
export class OrdersHeaderComponent {
	faArrowLeft = faArrowLeft

	@Input() headline: string = ""
	@Output() backButtonClick = new EventEmitter()
}
