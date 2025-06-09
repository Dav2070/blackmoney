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
import { VariationsTableDataSource, VariationsTableItem } from "./variations-table-datasource"
import { Variation } from "src/app/models/cash-register/variation.model"

@Component({
    selector: "app-variations-table",
    templateUrl: "./variations-table.component.html",
    styleUrl: "./variations-table.component.scss",
    standalone: false
})
export class VariationsTableComponent implements AfterViewInit, OnChanges {
    @ViewChild(MatPaginator) paginator!: MatPaginator
    @ViewChild(MatSort) sort!: MatSort
    @ViewChild(MatTable) table!: MatTable<VariationsTableItem>
    @Input() variations: Variation[] = [];

    dataSource: VariationsTableDataSource = new VariationsTableDataSource();
    editingVariation: Variation | null = null;
    newVariation: Variation | null = null;

    /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
    displayedColumns = ["id", "name", "preis", "actions"]

    ngAfterViewInit(): void {
        this.initializeDataSource();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes["variations"] && changes["variations"].currentValue) {
            this.initializeDataSource();
            this.cancelEdit();
        }
    }

	initializeDataSource(): void {
		if (this.variations) {
			this.dataSource = new VariationsTableDataSource(this.variations); // Variations werden übergeben
			
			if (this.sort && this.paginator && this.table) {
				this.dataSource.sort = this.sort;
				this.dataSource.paginator = this.paginator;
				this.table.dataSource = this.dataSource;
			}
		}
	}

    addNewVariation(): void {
        // Create a new variation with default values
        this.newVariation = {
            id: this.getNextVariationId(),
            name: "",
            preis: 0
        };
        
        // Add to variations temporarily
        this.variations.push(this.newVariation);
        this.initializeDataSource();
        
        // Set it as the currently edited item
        this.editingVariation = this.newVariation;
    }
    
    deleteVariation(variation: Variation): void {
        const index = this.variations.findIndex(v => v.id === variation.id);   
        if (index !== -1) {
            this.variations.splice(index, 1);
            this.initializeDataSource();
        }
    }
    
    getNextVariationId(): number {
        return this.variations.length > 0 
            ? Math.max(...this.variations.map(variation => variation.id)) + 1 
            : 1;
    }
    
    editVariation(variation: Variation): void {
        this.editingVariation = variation;
    }
    
    saveVariation(variation: Variation): void {
        this.editingVariation = null;
        this.newVariation = null;
        this.initializeDataSource();
    }
    
    cancelEdit(): void {
        if (this.newVariation) {
            // Remove the new variation if editing is canceled
            const index = this.variations.findIndex(variation => variation === this.newVariation);
            if (index !== -1) {
                this.variations.splice(index, 1);
            }
        }
        
        this.editingVariation = null;
        this.newVariation = null;
        this.initializeDataSource();
    }
    
    isEditing(variation: Variation): boolean {
        return variation === this.editingVariation;
    }
}