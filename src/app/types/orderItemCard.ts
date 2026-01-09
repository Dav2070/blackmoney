import { OrderItem } from "../models/OrderItem"

/**
 * Extended OrderItem type for UI card components.
 * Includes frontend-specific properties that are not part of the backend model.
 */
export type OrderItemCard = OrderItem & {
	/**
	 * UI state: whether the card is expanded to show details
	 */
	isExpanded?: boolean
}
