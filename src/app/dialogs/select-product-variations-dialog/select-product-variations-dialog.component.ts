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

@Component({
	selector: "app-select-product-variations-dialog",
	templateUrl: "./select-product-variations-dialog.component.html",
	styleUrl: "./select-product-variations-dialog.component.scss",
	standalone: false
})
export class SelectProductVariationsDialogComponent {
	faPlus = faPlus
	faMinus = faMinus
	Object = Object
	locale =
		this.localizationService.locale.dialogs.selectProductVariationsDialog
	actionsLocale = this.localizationService.locale.actions

	visible: boolean = false
	currentVariation: number = 0
	// selectedVariations: {
	// 	[key: string]: {
	// 		variationItem: VariationItem
	// 		count: number
	// 	}
	// } = {}
	// Index: variation index
	// Object key: list of variation item uuids separated by comma
	// Object value: count
	variationTree: {
		[key: string]: number
	}[] = []

	@Input() product: Product = null
	@Output() primaryButtonClick = new EventEmitter<{
		// selectedVariations: {
		// 	[key: string]: {
		// 		variationItem: VariationItem
		// 		count: number
		// 	}
		// }
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
			this.currentVariation = 0

			// Create the combinations tree
			this.variationTree = []

			let items: string[][] = []

			for (let i = 0; i < this.product.variations.length; i++) {
				const variation = this.product.variations[i]
				let currentItems: string[] = []

				for (const variationItem of variation.variationItems) {
					currentItems.push(variationItem.uuid)
				}

				items.push(currentItems)

				let variationTreeItem: { [key: string]: number } = {}

				for (const itemCombinations of this.cartesian(items)) {
					variationTreeItem[itemCombinations.join(",")] = 0
				}

				this.variationTree.push(variationTreeItem)
			}

			this.visible = true
		}, 100)
	}

	hide() {
		this.visible = false
	}

	addButtonClick(key: string, value: string) {
		this.variationTree[this.currentVariation][
			(key ? key + "," : "") + value
		]++
	}

	removeButtonClick(key: string, value: string) {
		const currentVariationKey = (key ? key + "," : "") + value

		if (this.variationTree[this.currentVariation][currentVariationKey] > 0) {
			this.variationTree[this.currentVariation][currentVariationKey]--
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

	getGroupedVariations(variationTree: { [key: string]: number }) {
		const groupedVariations: { [key: string]: { [key: string]: number } } = {}

		for (const key of Object.keys(variationTree)) {
			const keyParts = key.split(",")
			const headline = keyParts.splice(0, keyParts.length - 1).join(",")

			if (!groupedVariations[headline]) {
				groupedVariations[headline] = {}
			}

			groupedVariations[headline][keyParts[keyParts.length - 1]] =
				variationTree[key]
		}

		return groupedVariations
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

	submit() {
		if (this.currentVariation < this.product.variations.length - 1) {
			this.currentVariation++
			return
		}

		this.primaryButtonClick.emit({
			// selectedVariations: this.selectedVariations
		})
	}
}
