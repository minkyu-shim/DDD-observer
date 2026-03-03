import { Currency, Price, Domain } from "../branded-types.js"

export type Money = {
	readonly amount: Price
	readonly currency: Currency
}

export const createMoney = (amount: number, currency: string): Money => {
	return {
		amount: Domain.toPrice(amount),
		currency: Domain.toCurrency(currency),
	}
}

export const addMoney = (moneyA: Money, moneyB: Money): Money => {
	if (moneyA.currency !== moneyB.currency) {
		throw new Error(`Currency mismatch: cannot add ${moneyA.currency} to ${moneyB.currency}`)
	}

	return createMoney(moneyA.amount + moneyB.amount, moneyA.currency)
}

export const withAmount = (money: Money, newAmount: number): Money => {
	return createMoney(newAmount, money.currency)
}

export function runMoneyValueObjectDemo(): void {
	console.log("phase 5 / money value object demo")

	const burgerPrice = createMoney(12.5, "EUR")
	const friesPrice = createMoney(4, "EUR")
	const total = addMoney(burgerPrice, friesPrice)

	console.log("burger price:", burgerPrice)
	console.log("fries price:", friesPrice)
	console.log("total:", total)

	const updatedTotal = withAmount(total, 14)
	console.log("updated total (new object):", updatedTotal)
	console.log("original total unchanged:", total)

	try {
		addMoney(total, createMoney(2, "USD"))
		console.log("unexpected: this should have failed")
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.log("expected currency error:", message)
	}

	try {
		createMoney(-4, "EUR")
		console.log("unexpected: this should have failed")
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.log("expected amount error:", message)
	}
}
