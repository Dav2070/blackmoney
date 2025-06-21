import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map } from 'rxjs/operators';
import { Observable, of as observableOf, merge, BehaviorSubject } from 'rxjs';
import { Variation } from 'src/app/models/Variation';

export interface VariationsTableItem extends Variation {}

export class VariationsTableDataSource extends DataSource<VariationsTableItem> {
  data: VariationsTableItem[];
  paginator: MatPaginator | undefined;
  sort: MatSort | undefined;
  
  private dataSubject = new BehaviorSubject<VariationsTableItem[]>([]);

  constructor(variations: Variation[] = []) {
    super();
    this.data = variations as VariationsTableItem[];
    this.dataSubject.next(this.data);
  }

  connect(): Observable<VariationsTableItem[]> {
    if (this.paginator && this.sort) {
      // Combine everything that affects the rendered data into one update
      // stream for the data-table to consume.
      return merge(this.dataSubject, this.paginator.page, this.sort.sortChange)
        .pipe(map(() => {
          return this.getPagedData(this.getSortedData([...this.data]));
        }));
    } else {
      throw Error('Please set the paginator and sort on the data source before connecting.');
    }
  }

  disconnect(): void {
    this.dataSubject.complete();
  }

  private getPagedData(data: VariationsTableItem[]): VariationsTableItem[] {
    if (this.paginator) {
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      return data.splice(startIndex, this.paginator.pageSize);
    } else {
      return data;
    }
  }

  private getSortedData(data: VariationsTableItem[]): VariationsTableItem[] {
    if (!this.sort || !this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort?.direction === 'asc';
      switch (this.sort?.active) {
        case 'name': return compare(a.name, b.name, isAsc);
        default: return 0;
      }
    });
  }
}

function compare(a: string | number, b: string | number, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}