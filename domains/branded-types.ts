

export type Price = number & {readonly __brand: "Price"}

export const Domain = {
    toPrice: (val: number): Price => {
        if (val<0) throw new Error("Invalid Price")
        return val as Price;
    }
}