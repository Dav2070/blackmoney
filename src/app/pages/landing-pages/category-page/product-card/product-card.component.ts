import { Component, Input } from "@angular/core"
import { faEllipsis } from "@fortawesome/pro-regular-svg-icons"
import { Product } from "src/app/models/Product"
import { Variation } from "src/app/models/Variation"
import { VariationItem } from "src/app/models/VariationItem"

@Component({
	selector: "app-product-card",
	templateUrl: "./product-card.component.html",
	styleUrl: "./product-card.component.scss",
	standalone: false
})
export class ProductCardComponent {
   faEllipsis = faEllipsis
   @Input() product: Product = null

	// Variation tooltip overlay state
	variationTooltipVisible = false
	variationTooltipItems: VariationItem[] = []
	variationTooltipTitle = ""
	variationTooltipX = 0
	variationTooltipY = 0
	tooltipHideTimeout: any

	showVariationTooltip(event: MouseEvent, variation: Variation) {
		if (this.tooltipHideTimeout) {
			clearTimeout(this.tooltipHideTimeout)
			this.tooltipHideTimeout = null
		}

		const target = event.currentTarget as HTMLElement
		const rect = target.getBoundingClientRect()

		this.variationTooltipTitle = variation.name
		this.variationTooltipItems = variation.variationItems ?? []
		this.variationTooltipX = rect.right - 240
		this.variationTooltipY = rect.bottom + 8
		this.variationTooltipVisible = true
	}

	scheduleHideVariationTooltip() {
		this.tooltipHideTimeout = setTimeout(() => {
			this.variationTooltipVisible = false
			this.variationTooltipItems = []
		}, 120)
	}

	keepTooltipOpen() {
		if (this.tooltipHideTimeout) {
			clearTimeout(this.tooltipHideTimeout)
			this.tooltipHideTimeout = null
		}
	}
}
