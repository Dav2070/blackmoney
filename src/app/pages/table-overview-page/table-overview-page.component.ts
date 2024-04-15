import { Component, OnInit } from "@angular/core"
import { MatCardModule } from "@angular/material/card"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { MatInputModule } from "@angular/material/input"
import { MatSelectModule } from "@angular/material/select"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatToolbarModule } from "@angular/material/toolbar"

interface Room {
	value: string
	viewValue: string
	tables: string[]
}

@Component({
	templateUrl: "./table-overview-page.component.html",
	styleUrl: "./table-overview-page.component.scss",
	standalone: true,
	imports: [
		MatCardModule,
		CommonModule,
		FormsModule,
		MatInputModule,
		MatSelectModule,
		MatFormFieldModule,
		MatToolbarModule
	]
})
export class TableOverviewPageComponent implements OnInit {
	
	rooms: Room[] = [
		{ value: "restaurant", viewValue: "Restaurant", tables: [] },
		{ value: "biergarten", viewValue: "Biergarten", tables: ["3", "4", "5"] }
	]

	

	selected = this.rooms[0];

	ngOnInit(): void {
		for(var i =0;i<=20;i++){
			this.selected.tables.push(i.toString());
		};
	}

	
}
