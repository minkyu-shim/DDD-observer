import { v4 as uuidv4 } from "uuid"
import { Domain, Email, Price } from "../branded-types.js"

export type OrderId = string & { readonly __brand: unique symbol }

export type OrderStatus = "open" | "closed" | "cancelled"

export type Order = {
	readonly id: OrderId
	readonly customerName: string
	readonly customerEmail: Email
	readonly unitPrice: Price
	readonly quantity: number
	readonly totalAmount: Price
	readonly status: OrderStatus
}

const toOrderId = (): OrderId => {
	return `order-${uuidv4()}` as OrderId
}

const toOrderPrice = (value: number): Price => {
	if (value <= 0) throw new Error("Invalid amount: must be greater than 0")
	if (!Number.isFinite(value)) throw new Error("Invalid amount: must be a finite number")
	return Domain.toPrice(value)
}

const toItemCount = (count: number): number => {
	if (!Number.isInteger(count)) throw new Error("Invalid quantity: must be a whole number")
	if (count <= 0) throw new Error("Invalid quantity: must be greater than 0")
	return count
}

export const createOrder = (
	customerName: string,
	customerEmail: string,
	unitPrice: number,
	quantity: number
): Order => {
	const name = customerName.trim()
	if (name.length === 0) throw new Error("Invalid customerName: cannot be empty")

	const validUnitPrice = Domain.toPrice(unitPrice)
	const validQuantity = toItemCount(quantity)
	const validEmail = Domain.toEmail(customerEmail)
	const total = toOrderPrice(Number(validUnitPrice) * validQuantity)

	return {
		id: toOrderId(),
		customerName: name,
		customerEmail: validEmail,
		unitPrice: validUnitPrice,
		quantity: validQuantity,
		totalAmount: total,
		status: "open",
	}
}

export const addItem = (order: Order, unitPrice: number, quantity: number): Order => {
	if (order.status !== "open") {
		throw new Error(`Cannot add item to an order with status ${order.status}`)
	}

	const validUnitPrice = toOrderPrice(unitPrice)
	const validQuantity = toItemCount(quantity)
	const lineAmount = toOrderPrice(Number(validUnitPrice) * validQuantity)

	return {
		...order,
		unitPrice: validUnitPrice,
		quantity: order.quantity + validQuantity,
		totalAmount: toOrderPrice(Number(order.totalAmount) + Number(lineAmount)),
	}
}

export const closeOrder = (order: Order): Order => {
	if (order.status === "closed") {
		throw new Error("Order is already closed")
	}
	if (order.status === "cancelled") {
		throw new Error("Cannot close a cancelled order")
	}

	return {
		...order,
		status: "closed",
	}
}

export const cancelOrder = (order: Order): Order => {
	if (order.status === "cancelled") {
		throw new Error("Order is already cancelled")
	}
	if (order.status === "closed") {
		throw new Error("Cannot cancel a closed order")
	}

	return {
		...order,
		status: "cancelled",
	}
}

export function runOrderEntityDemo(): void {
	console.log("phase 6 / order entity demo")

	const first = createOrder("Martin", "martin@example.com", 12.5, 2)
	const second = createOrder("Tristan", "tristan@example.com", 8, 1)
	console.log("two distinct orders have different ids:", first.id !== second.id)

	const withDrink = addItem(first, 4, 1)
	console.log("after addItem (new object):", withDrink)
	console.log("first remains unchanged:", first)

	const closed = closeOrder(withDrink)
	console.log("after closeOrder:", closed.status)

	try {
		addItem(closed, 2, 1)
		console.log("unexpected: invalid state transition accepted")
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.log("expected state error:", message)
	}

	try {
		closeOrder(closeOrder(second))
		console.log("unexpected: double close accepted")
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.log("expected close error:", message)
	}

	const cancelled = cancelOrder(second)
	console.log("cancelled order status:", cancelled.status)
}
