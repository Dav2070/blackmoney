import { DataSource } from "@angular/cdk/collections"
import { MatPaginator } from "@angular/material/paginator"
import { MatSort } from "@angular/material/sort"
import { map } from "rxjs/operators"
import { Observable, merge, BehaviorSubject } from "rxjs"
import { Offer } from "src/app/models/Offer"

export class SpecialsTableDataSource extends DataSource<Offer> {
	data: Offer[]
	paginator: MatPaginator | undefined
	sort: MatSort | undefined

	private dataSubject = new BehaviorSubject<Offer[]>([])

	constructor(specials: Offer[] = []) {
		super()
		this.data = specials as Offer[]
		this.dataSubject.next(this.data)
	}

	connect(): Observable<Offer[]> {
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

	private getPagedData(data: Offer[]): Offer[] {
		if (this.paginator) {
			const startIndex = this.paginator.pageIndex * this.paginator.pageSize
			return data.splice(startIndex, this.paginator.pageSize)
		} else {
			return data
		}
	}

	private getSortedData(data: Offer[]): Offer[] {
		if (!this.sort || !this.sort.active || this.sort.direction === "") {
			return data
		}

		return data.sort((a, b) => {
			const isAsc = this.sort?.direction === "asc"
			switch (this.sort?.active) {
				case "uuid":
					return compare(a.uuid, b.uuid, isAsc)
				case "name":
					return compare(
						a.product?.name ?? "",
						b.product?.name ?? "",
						isAsc
					)
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
