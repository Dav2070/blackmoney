import { Component, Inject, PLATFORM_ID } from "@angular/core"
import { isPlatformServer } from "@angular/common"
import { DataService } from "src/app/services/data-service"
import { randomNumber } from "src/app/utils"

@Component({
	templateUrl: "./user-page.component.html",
	styleUrl: "./user-page.component.scss",
	standalone: false
})
export class UserPageComponent {
	title = ""
	titles = [
		"Willkommen zurück, {0}!",
		"Schön dich wiederzusehen, {0}!",
		"Hey {0}!",
		"Hallo {0}!",
		"Moin {0}!",
		"Grüezi {0}!"
	]

	constructor(
		public dataService: DataService,
		@Inject(PLATFORM_ID) private platformId: object
	) {}

	async ngOnInit() {
		if (isPlatformServer(this.platformId)) return

		await this.dataService.davUserPromiseHolder.AwaitResult()

		const n = randomNumber(0, this.titles.length)

		this.title = this.titles[n].replace(
			"{0}",
			this.dataService.dav.user.FirstName
		)
	}
}
