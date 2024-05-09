export function isClient(): boolean {
	return typeof navigator != "undefined"
}

export function isServer(): boolean {
	return typeof navigator == "undefined"
}
