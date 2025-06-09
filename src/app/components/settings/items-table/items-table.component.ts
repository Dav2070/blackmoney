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
import { Variation } from "src/app/models/cash-register/variation.model"

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
    @Input() availableVariations: Variation[] = []

    dataSource: ItemsTableDataSource = new ItemsTableDataSource([])
    editingItem: Item | null = null;
    newItem: Item | null = null;

    displayedColumns = ["id", "name", "price", "variations", "actions"]

    ngAfterViewInit(): void {
        this.initializeDataSource();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes["Inventory"] && changes["Inventory"].currentValue) {
            this.initializeDataSource();
            this.cancelEdit();
        }
    }

    initializeDataSource(): void {
        if (this.Inventory && this.Inventory.items) {
            this.dataSource = new ItemsTableDataSource(this.Inventory.items);
            
            if (this.sort && this.paginator && this.table) {
                this.dataSource.sort = this.sort;
                this.dataSource.paginator = this.paginator;
                this.table.dataSource = this.dataSource;
            }
        }
    }

    addNewItem(): void {
        // Create a new item with default values
        this.newItem = {
            id: this.getNextItemId(),
            name: "",
            price: 0,
            variations: []
        };
        
        // Add to inventory temporarily
        this.Inventory.items.push(this.newItem);
        this.initializeDataSource();
        
        // Set it as the currently edited item
        this.editingItem = this.newItem;
        
        // Navigate to the page containing the new item
        if (this.paginator) {
            const lastPage = Math.ceil(this.Inventory.items.length / this.paginator.pageSize) - 1;
            this.paginator.pageIndex = lastPage;
            this.paginator.page.emit({
                pageIndex: lastPage,
                pageSize: this.paginator.pageSize,
                length: this.Inventory.items.length
            });
        }
    }

    deleteItem(item: Item): void {
        const index = this.Inventory.items.findIndex(i => i.id === item.id);   
        if (index !== -1) {
            this.Inventory.items.splice(index, 1);
            this.initializeDataSource();
        }
    }
    
    getNextItemId(): number {
        return this.Inventory.items.length > 0 
            ? Math.max(...this.Inventory.items.map(item => item.id)) + 1 
            : 1;
    }
    
    editItem(item: Item): void {
        this.editingItem = item;
    }
    
    saveItem(item: Item): void {
        this.editingItem = null;
        this.newItem = null;
        this.initializeDataSource();
    }
    
    cancelEdit(): void {
        if (this.newItem) { // Wenn item neu ist, und nicht gespeichert wurde, entfernen
            const index = this.Inventory.items.findIndex(item => item === this.newItem);
            if (index !== -1) {
                this.Inventory.items.splice(index, 1);
            }
        }
        
        this.editingItem = null;
        this.newItem = null;
        this.initializeDataSource();
    }
    
	isEditing(item: Item): boolean {
		return item === this.editingItem;
	}
    
    getSelectedVariationIds(item: Item): number[] {
        return item.variations?.map(v => v.id) || [];
    }
    
    updateVariations(item: Item, selectedIds: number[]): void {
        if (!item.variations) {
            item.variations = [];
        }
        
        item.variations = selectedIds
            .map(id => this.availableVariations.find(v => v.id === id))
            .filter(v => v !== undefined)
            .map(v => ({...v!}));
    }
}