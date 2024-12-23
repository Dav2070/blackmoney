import { Component, Input } from "@angular/core"
import { Observable } from "rxjs"
import { TimeService } from "src/app/services/time.service"

@Component({
	selector: "app-header",
	templateUrl: "./header.component.html",
	styleUrl: "./header.component.scss"
})
export class HeaderComponent {
	@Input()
	showButton: Boolean = true

	date$: Observable<any>
	bediener: String = "Bediener 1"

	constructor(private timeService: TimeService) {
		/*TO-DO: Die Seite lässt sich nicht neu
		laden. Man müsste mal nachschauen warum
		es so ist und den Timer fixen oder ähnliches
		*/
		//this.date$ = this.timeService.getDate()
	}
}
