import { Injectable } from "@angular/core"
import { ApiService } from "./api-service"
import { SendMessage, ReceiveMessage } from "../types"

@Injectable()
export class MessageService {
	port: MessagePort = null

	constructor(private apiService: ApiService) {}

	init() {
		if (this.port != null) return

		window.addEventListener("message", event => {
			// get the port then use it for communication.
			this.port = event.ports[0]
			if (typeof this.port === "undefined") return

			// Receive upcoming messages on this port.
			this.port.onmessage = async event => this.onMessageReceived(event)
		})
	}

	postMessage(message: SendMessage) {
		if (this.port == null) return

		this.port.postMessage(JSON.stringify(message))
	}

	async onMessageReceived(event: MessageEvent<string>) {
		let message: ReceiveMessage = null

		try {
			message = JSON.parse(event.data) as ReceiveMessage
		} catch (error) {
			console.error("Error parsing message data: ", error)
			return
      }

		if (message.type === "createStripeConnectionToken") {
			const response = await this.apiService.createStripeConnectionToken()
			const secret = response.data.createStripeConnectionToken.secret

			this.postMessage({
				type: "createStripeConnectionToken",
				secret
			})
		} else if (
			message.type === "captureStripePaymentIntent" &&
			message.id != null
		) {
			const response = await this.apiService.captureStripePaymentIntent(
				`id`,
				{
					id: message.id
				}
			)

			const success = response.data.captureStripePaymentIntent.id != null
			console.log(response, success)
		}
	}
}
