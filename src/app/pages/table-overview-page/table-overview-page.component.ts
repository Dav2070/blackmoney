import { Component } from "@angular/core"

interface Room {
	value: string
	viewValue: string
	tables: string[]
}

@Component({
	templateUrl: "./table-overview-page.component.html",
	styleUrl: "./table-overview-page.component.scss"
})
export class TableOverviewPageComponent {
	rooms: Room[] = [
		{ value: "restaurant", viewValue: "Restaurant", tables: [] },
		{ value: "biergarten", viewValue: "Biergarten", tables: ["3", "4", "5"] }
	]

	selected = this.rooms[0]

	ngOnInit(): void {
		for (var i = 0; i <= 20; i++) {
			this.selected.tables.push(i.toString())
		}
	}
}
