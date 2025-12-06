import {
	Component,
	Input,
	Output,
	EventEmitter,
	ElementRef,
	ViewChild,
	Inject,
	PLATFORM_ID
} from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { faPlus, faMinus } from "@fortawesome/pro-regular-svg-icons"
import { Dialog } from "dav-ui-components"
import { LocalizationService } from "src/app/services/localization-service"
import { Product } from "src/app/models/Product"
import { VariationItem } from "src/app/models/VariationItem"
import { OrderItem } from "src/app/models/OrderItem"

@Component({
	selector: "app-subtract-product-variations-dialog",
	templateUrl: "./subtract-product-variations-dialog.component.html",
	styleUrl: "./subtract-product-variations-dialog.component.scss",
	standalone: false
})
export class SubtractProductVariationsDialogComponent {
	faPlus = faPlus
	faMinus = faMinus
	Object = Object
	locale =
		this.localizationService.locale.dialogs.subtractProductVariationsDialog
	actionsLocale = this.localizationService.locale.actions

	visible: boolean = false
	// Object key: list of variation item uuids separated by comma (full combination)
	// Object value: count
	variationCombinations: { [key: string]: number } = {}
	originalVariationCombinations: { [key: string]: number } = {}

	@Input() orderItem: OrderItem = null

	get product(): Product {
		return this.orderItem?.product
	}
	@Output() primaryButtonClick = new EventEmitter<{
		variationCombinations: {
			[key: string]: number
		}
	}>()
	@ViewChild("dialog") dialog: ElementRef<Dialog>

	constructor(
		private localizationService: LocalizationService,
		@Inject(PLATFORM_ID) private platformId: object
	) {}

	ngAfterViewInit() {
		if (isPlatformBrowser(this.platformId)) {
			document.body.appendChild(this.dialog.nativeElement)
		}
	}

	ngOnDestroy() {
		if (isPlatformBrowser(this.platformId)) {
			document.body.removeChild(this.dialog.nativeElement)
		}
	}

	show() {
		setTimeout(() => {
			// Create all final combinations directly
			this.variationCombinations = {}

			let items: string[][] = []

			for (const variation of this.product.variations) {
				const currentItems: string[] = []
				for (const variationItem of variation.variationItems) {
					currentItems.push(variationItem.uuid)
				}
				items.push(currentItems)
			}

			// Generate all combinations
			for (const combination of this.cartesian(items)) {
				this.variationCombinations[combination.join(",")] = 0
			}

			// Load existing variations from orderItem
			this.loadExistingVariations()

			// Save a copy of the original values
			this.originalVariationCombinations = JSON.parse(
				JSON.stringify(this.variationCombinations)
			)

			this.visible = true
		}, 100)
	}

	hide() {
		this.visible = false
	}

	loadExistingVariations() {
		if (!this.orderItem || !this.orderItem.orderItemVariations) return

		for (const orderItemVariation of this.orderItem.orderItemVariations) {
			// Build the key from variationItems
			const key = orderItemVariation.variationItems
				.map(vi => vi.uuid)
				.join(",")

			// Set the count if this combination exists
			if (this.variationCombinations[key] !== undefined) {
				this.variationCombinations[key] = orderItemVariation.count
			}
		}
	}

	removeButtonClick(key: string) {
		if (this.variationCombinations[key] > 0) {
			this.variationCombinations[key]--
		}
	}

	addButtonClick(key: string) {
		const originalCount = this.getOriginalCount(key)
		if (this.variationCombinations[key] < originalCount) {
			this.variationCombinations[key]++
		}
	}

	cartesian(args: string[][]) {
		var r: string[][] = [],
			max = args.length - 1

		const helper = (arr: string[], i: number) => {
			for (var j = 0, l = args[i].length; j < l; j++) {
				var a = arr.slice(0) // clone arr
				a.push(args[i][j])
				if (i == max) r.push(a)
				else helper(a, i + 1)
			}
		}

		helper([], 0)
		return r
	}

	getHeadlineForKey(key: string) {
		const keyParts = key.split(",")
		const variationItems: VariationItem[] = []

		for (const variationItemUuid of keyParts) {
			const variationItem = this.product.variations
				.map(v => v.variationItems)
				.flat()
				.find(v => v.uuid === variationItemUuid)

			if (variationItem) variationItems.push(variationItem)
		}

		return variationItems.map(v => v.name).join(", ")
	}

	getOriginalCount(variationKey: string): number {
		return this.originalVariationCombinations[variationKey] ?? 0
	}

	submit() {
		this.primaryButtonClick.emit({
			variationCombinations: this.variationCombinations
		})
	}
}
