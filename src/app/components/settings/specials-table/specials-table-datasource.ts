import { DataSource } from "@angular/cdk/collections"
import { MatPaginator } from "@angular/material/paginator"
import { MatSort } from "@angular/material/sort"
import { map } from "rxjs/operators"
import { Observable, of as observableOf, merge, BehaviorSubject } from "rxjs"
import { Menu } from "src/app/models/Menu"

export interface SpecialsTableItem extends Menu {}

export class SpecialsTableDataSource extends DataSource<SpecialsTableItem> {
	data: SpecialsTableItem[]
	paginator: MatPaginator | undefined
	sort: MatSort | undefined

	private dataSubject = new BehaviorSubject<SpecialsTableItem[]>([])

	constructor(specials: Menu[] = []) {
		super()
		this.data = specials as SpecialsTableItem[]
		this.dataSubject.next(this.data)
	}

	connect(): Observable<SpecialsTableItem[]> {
		if (this.paginator && this.sort) {
			return merge(
				this.dataSubject,
				this.paginator.page,
				this.sort.sortChange
			).pipe(
				map(() => {
					return this.getPagedData(this.getSortedData([...this.data]))
				})
			)
		} else {
			throw Error(
				"Please set the paginator and sort on the data source before connecting."
			)
		}
	}

	disconnect(): void {
		this.dataSubject.complete()
	}

	private getPagedData(data: SpecialsTableItem[]): SpecialsTableItem[] {
		if (this.paginator) {
			const startIndex = this.paginator.pageIndex * this.paginator.pageSize
			return data.splice(startIndex, this.paginator.pageSize)
		} else {
			return data
		}
	}

	private getSortedData(data: SpecialsTableItem[]): SpecialsTableItem[] {
		if (!this.sort || !this.sort.active || this.sort.direction === "") {
			return data
		}

		return data.sort((a, b) => {
			const isAsc = this.sort?.direction === "asc"
			switch (this.sort?.active) {
				case "uuid":
					return compare(a.uuid, b.uuid, isAsc)
				case "name":
					return compare(a.name, b.name, isAsc)
				default:
					return 0
			}
		})
	}
}

function compare(
	a: string | number | boolean,
	b: string | number | boolean,
	isAsc: boolean
): number {
	return (a < b ? -1 : 1) * (isAsc ? 1 : -1)
}
