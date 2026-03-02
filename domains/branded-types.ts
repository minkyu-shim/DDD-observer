export type Price = number & { readonly __brand: "Price" }
export type Email = string & { readonly __brand: "Email" }

export const Domain = {
	toPrice: (val: number): Price => {
		if (val < 0) throw new Error("Invalid Price")
		return val as Price
	},
	toEmail: (val: string): Email => {
		if (!val.includes("@")) throw new Error("Invalid Email")
		return val as Email
	},
}
