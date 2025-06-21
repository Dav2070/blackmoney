import { DataSource } from "@angular/cdk/collections"
import { MatPaginator } from "@angular/material/paginator"
import { MatSort } from "@angular/material/sort"
import { map } from "rxjs/operators"
import { Observable, of as observableOf, merge } from "rxjs"
import { Product } from "src/app/models/Product"

export interface ItemsTableItem extends Product {}

export class ItemsTableDataSource extends DataSource<ItemsTableItem> {
    data: Product[] = []
    paginator: MatPaginator | undefined
    sort: MatSort | undefined

    constructor(products: Product[]) {
        super()
        this.data = products
    }

    connect(): Observable<ItemsTableItem[]> {
        if (this.paginator && this.sort) {
            return merge(
                observableOf(this.data),
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

    disconnect(): void {}

    private getPagedData(data: ItemsTableItem[]): ItemsTableItem[] {
        if (this.paginator) {
            const startIndex = this.paginator.pageIndex * this.paginator.pageSize
            return data.splice(startIndex, this.paginator.pageSize)
        } else {
            return data
        }
    }

    private getSortedData(data: ItemsTableItem[]): ItemsTableItem[] {
        if (!this.sort || !this.sort.active || this.sort.direction === "") {
            return data
        }

        return data.sort((a, b) => {
            const isAsc = this.sort?.direction === "asc"
            switch (this.sort?.active) {
                case "name":
                    return compare(a.name, b.name, isAsc)
                case "id":
                    return compare(+a.id, +b.id, isAsc)
                case "price":
                    return compare(+a.price, +b.price, isAsc)
                default:
                    return 0
            }
        })
    }
}

function compare(
    a: string | number,
    b: string | number,
    isAsc: boolean
): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1)
}