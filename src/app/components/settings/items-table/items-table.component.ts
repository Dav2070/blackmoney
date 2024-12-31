import {
	AfterViewInit,
	Component,
	Input,
	OnChanges,
	SimpleChanges,
	ViewChild
} from "@angular/core"
import { MatTable } from "@angular/material/table"
import { MatPaginator } from "@angular/material/paginator"
import { MatSort } from "@angular/material/sort"
import { ItemsTableDataSource, ItemsTableItem } from "./items-table-datasource"
import { Item } from "src/app/models/cash-register/item.model"
import { Inventory } from "src/app/models/cash-register/inventory.model"

@Component({
	selector: "app-items-table",
	templateUrl: "./items-table.component.html",
	styleUrl: "./items-table.component.scss",
	standalone: false
})
export class ItemsTableComponent implements AfterViewInit, OnChanges {
	@ViewChild(MatPaginator) paginator!: MatPaginator
	@ViewChild(MatSort) sort!: MatSort
	@ViewChild(MatTable) table!: MatTable<ItemsTableItem>
	@Input() Inventory: Inventory

	dataSource: ItemsTableDataSource = new ItemsTableDataSource([])

	/** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
	displayedColumns = ["id", "name", "price", "variations"]

	ngAfterViewInit(): void {
		this.dataSource = new ItemsTableDataSource(this.Inventory.items)
		this.dataSource.sort = this.sort
		this.dataSource.paginator = this.paginator
		this.table.dataSource = this.dataSource
	}

	ngOnChanges(changes: SimpleChanges) {
		this.dataSource = new ItemsTableDataSource(
			changes["Inventory"].currentValue.items
		)
		this.dataSource.sort = this.sort
		this.dataSource.paginator = this.paginator
		this.table.dataSource = this.dataSource
	}
}
