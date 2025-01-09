import { AfterViewInit, Component, ViewChild } from "@angular/core"
import { MatTable } from "@angular/material/table"
import { MatPaginator } from "@angular/material/paginator"
import { MatSort } from "@angular/material/sort"
import {
	VariationsTableDataSource,
	VariationsTableItem
} from "./variations-table-datasource"

@Component({
	selector: "app-variations-table",
	templateUrl: "./variations-table.component.html",
	styleUrl: "./variations-table.component.scss",
	standalone: false
})
export class VariationsTableComponent implements AfterViewInit {
	@ViewChild(MatPaginator) paginator!: MatPaginator
	@ViewChild(MatSort) sort!: MatSort
	@ViewChild(MatTable) table!: MatTable<VariationsTableItem>
	dataSource = new VariationsTableDataSource()

	/** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
	displayedColumns = ["id", "name"]

	ngAfterViewInit(): void {
		this.dataSource.sort = this.sort
		this.dataSource.paginator = this.paginator
		this.table.dataSource = this.dataSource
	}
}
