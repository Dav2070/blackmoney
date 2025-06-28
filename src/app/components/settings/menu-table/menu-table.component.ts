import {
    AfterViewInit,
    Component,
    Input,
    OnChanges,
    SimpleChanges,
    ViewChild
} from "@angular/core";
import { MatTable } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MenuTableDataSource, MenuTableItem } from "./menu-table-datasource";
import { Menu } from "src/app/models/Menu";
import { Category } from "src/app/models/Category";
import { Product } from "src/app/models/Product";

@Component({
    selector: "app-menu-table",
    templateUrl: "./menu-table.component.html",
    styleUrl: "./menu-table.component.scss",
    standalone: false
})
export class MenuTableComponent implements AfterViewInit, OnChanges {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatTable) table!: MatTable<MenuTableItem>;
    @Input() menus: Menu[] = [];
    @Input() availableCategories: Category[] = [];

    dataSource: MenuTableDataSource = new MenuTableDataSource([]);
    editingMenu: Menu | null = null;
    newMenu: Menu | null = null;

    selectedCategoryForProducts: Category | null = null;
    displayedColumns = ["name", "categories", "products", "isActive", "actions"];

    ngAfterViewInit(): void {
        this.initializeDataSource();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes["menus"] && changes["menus"].currentValue) {
            this.initializeDataSource();
            this.cancelEdit();
        }
    }

    initializeDataSource(): void {
        if (this.menus) {
            this.dataSource = new MenuTableDataSource(this.menus);
            
            if (this.sort && this.paginator && this.table) {
                this.dataSource.sort = this.sort;
                this.dataSource.paginator = this.paginator;
                this.table.dataSource = this.dataSource;
            }
        }
    }

    addNewMenu(): void {
        // Create a new menu with default values
        this.newMenu = {
            uuid: 'menu_' + Date.now(),
            name: "Neues Menü",
            categories: [],
            selectedProducts: [], // Initialize empty products array
            isActive: false
        };
        
        // Add to menus temporarily
        this.menus.push(this.newMenu);
        this.initializeDataSource();
        
        // Set it as the currently edited menu
        this.editingMenu = this.newMenu;
    }

    deleteMenu(menu: Menu): void {
        const index = this.menus.findIndex(m => m.uuid === menu.uuid);   
        if (index !== -1) {
            this.menus.splice(index, 1);
            this.initializeDataSource();
        }
    }
    
    editMenu(menu: Menu): void {
        this.editingMenu = menu;
    }
    
    saveMenu(menu: Menu): void {
        this.editingMenu = null;
        this.newMenu = null;
        this.initializeDataSource();
    }
    
    cancelEdit(): void {
        if (this.newMenu) {
            const index = this.menus.findIndex(menu => menu === this.newMenu);
            if (index !== -1) {
                this.menus.splice(index, 1);
            }
        }
        
        this.editingMenu = null;
        this.newMenu = null;
        this.initializeDataSource();
    }
    
    isEditing(menu: Menu): boolean {
        return menu === this.editingMenu;
    }
    
    getSelectedCategories(menu: Menu): string[] {
        if (!menu.categories || menu.categories.length === 0) return [];
        
        return menu.categories.map(category => category.uuid);
    }

    updateMenuCategories(menu: Menu, selectedCategoryIds: string[]): void {
        if (!menu.categories) {
            menu.categories = [];
        } else {
            menu.categories = [];
        }
        
        // Add each selected category to the menu
        for (const categoryId of selectedCategoryIds) {
            const category = this.availableCategories.find(c => c.uuid === categoryId);
            if (category) {
                menu.categories.push(category);
            }
        }
    }
    
    getAvailableProductsForMenu(menu: Menu): Product[] {
        if (!menu.categories || menu.categories.length === 0) return [];
        
        const products: Product[] = [];
        for (const category of menu.categories) {
            if (category.products && category.products.length > 0) {
                products.push(...category.products);
            }
        }
        return products;
    }
    
    isProductSelected(menu: Menu, product: Product): boolean {
        if (!menu.selectedProducts) return false;
        return menu.selectedProducts.some(p => p.uuid === product.uuid);
    }
    
    toggleProductSelection(menu: Menu, product: Product): void {
        if (!menu.selectedProducts) {
            menu.selectedProducts = [];
        }
        
        const index = menu.selectedProducts.findIndex(p => p.uuid === product.uuid);
        if (index === -1) {
            // Add product
            menu.selectedProducts.push(product);
        } else {
            // Remove product
            menu.selectedProducts.splice(index, 1);
        }
    }
    
    selectAllProductsInCategory(menu: Menu, category: Category): void {
        if (!menu.selectedProducts) {
            menu.selectedProducts = [];
        }
        
        if (!category.products || category.products.length === 0) return;
        
        // Add all products from this category if not already selected
        for (const product of category.products) {
            if (!this.isProductSelected(menu, product)) {
                menu.selectedProducts.push(product);
            }
        }
    }
    
    deselectAllProductsInCategory(menu: Menu, category: Category): void {
        if (!menu.selectedProducts || !category.products) return;
        
        // Remove all products that belong to this category
        menu.selectedProducts = menu.selectedProducts.filter(p => {
            return !category.products.some(catProduct => catProduct.uuid === p.uuid);
        });
    }
    
    setSelectedCategoryForProducts(category: Category | null): void {
        this.selectedCategoryForProducts = category;
    }
}