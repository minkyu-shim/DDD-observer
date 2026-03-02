export type Price = number & { readonly __brand: "Price" }
export type Email = string & { readonly __brand: "Email" }

export const Domain = {
	toPrice: (val: number): Price => {
		if (!Number.isFinite(val)) throw new Error("Invalid Price: must be a finite number")
		if (val < 0) throw new Error("Invalid Price: cannot be negative")
		return val as Price
	},
	toEmail: (val: string): Email => {
		const trimmed = val.trim()
		if (!trimmed.includes("@")) throw new Error("Invalid Email: missing '@'")
		const parts = trimmed.split("@")
		if (parts.length !== 2 || parts[0].length === 0 || parts[1].length === 0) {
			throw new Error("Invalid Email: local or domain part is missing")
		}
		return trimmed as Email
	},
}
