import { v4 as uuidv4 } from "uuid"
import { Domain, Email, Price } from "../branded-types.js"

export type OrderId = string & { readonly __brand: unique symbol }

export type OrderStatus = "open" | "closed" | "cancelled"

export type Observer<T> = (event: T) => void

export type OrderEvent =
	| {
		type: "ItemAdded"
		orderId: OrderId
		addedQuantity: number
		newQuantity: number
		total: Price
	}
	| {
		type: "OrderClosed"
		orderId: OrderId
	}
	| {
		type: "OrderCancelled"
		orderId: OrderId
	}

export type Order = {
	readonly id: OrderId
	readonly customerName: string
	readonly customerEmail: Email
	readonly unitPrice: Price
	readonly quantity: number
	readonly totalAmount: Price
	readonly status: OrderStatus
	readonly observers: Array<Observer<OrderEvent>>
}

const toOrderId = (): OrderId => {
	return `order-${uuidv4()}` as OrderId
}

const toOrderPrice = (value: number): Price => {
	if (!Number.isFinite(value)) throw new Error("Invalid amount: must be a finite number")
	if (value <= 0) throw new Error("Invalid amount: must be greater than 0")
	return Domain.toPrice(value)
}

const toItemCount = (count: number): number => {
	if (!Number.isInteger(count)) throw new Error("Invalid quantity: must be a whole number")
	if (count <= 0) throw new Error("Invalid quantity: must be greater than 0")
	return count
}

const notify = (observers: Array<Observer<OrderEvent>>, event: OrderEvent): void => {
	for (let i = 0; i < observers.length; i++) {
		observers[i](event)
	}
}

export const createOrder = (
	customerName: string,
	customerEmail: string,
	unitPrice: number,
	quantity: number
): Order => {
	const name = customerName.trim()
	if (name.length === 0) throw new Error("Invalid customerName: cannot be empty")

	const validUnitPrice = toOrderPrice(unitPrice)
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
		observers: [],
	}
}

export const addItem = (order: Order, unitPrice: number, quantity: number): Order => {
	if (order.status !== "open") {
		throw new Error(`Cannot add item to an order with status ${order.status}`)
	}

	const validUnitPrice = toOrderPrice(unitPrice)
	const validQuantity = toItemCount(quantity)
	const lineAmount = toOrderPrice(Number(validUnitPrice) * validQuantity)
	const newTotal = toOrderPrice(Number(order.totalAmount) + Number(lineAmount))
	const next: Order = {
		...order,
		unitPrice: validUnitPrice,
		quantity: order.quantity + validQuantity,
		totalAmount: newTotal,
		observers: order.observers,
	}

	const event: OrderEvent = {
		type: "ItemAdded",
		orderId: next.id,
		addedQuantity: validQuantity,
		newQuantity: next.quantity,
		total: next.totalAmount,
	}
	notify(next.observers, event)
	return next
}

export const closeOrder = (order: Order): Order => {
	if (order.status === "closed") {
		throw new Error("Order is already closed")
	}
	if (order.status === "cancelled") {
		throw new Error("Cannot close a cancelled order")
	}

	const next: Order = {
		...order,
		status: "closed",
		observers: order.observers,
	}
	const event: OrderEvent = { type: "OrderClosed", orderId: next.id }
	notify(next.observers, event)
	return next
}

export const cancelOrder = (order: Order): Order => {
	if (order.status === "cancelled") {
		throw new Error("Order is already cancelled")
	}
	if (order.status === "closed") {
		throw new Error("Cannot cancel a closed order")
	}

	const next: Order = {
		...order,
		status: "cancelled",
		observers: order.observers,
	}
	const event: OrderEvent = { type: "OrderCancelled", orderId: next.id }
	notify(next.observers, event)
	return next
}

export const subscribe = (order: Order, observer: Observer<OrderEvent>): Order => {
	const newObservers: Array<Observer<OrderEvent>> = []
	for (let i = 0; i < order.observers.length; i++) {
		newObservers.push(order.observers[i])
	}
	newObservers.push(observer)

	return {
		...order,
		observers: newObservers,
	}
}

export const unsubscribe = (order: Order, observer: Observer<OrderEvent>): Order => {
	const remainingObservers: Array<Observer<OrderEvent>> = []
	for (let i = 0; i < order.observers.length; i++) {
		if (order.observers[i] !== observer) {
			remainingObservers.push(order.observers[i])
		}
	}

	return {
		...order,
		observers: remainingObservers,
	}
}

export function runOrderEntityDemo(): void {
	console.log("phase 7 / order entity + observers demo")

	let order = createOrder("Martin", "martin@example.com", 12.5, 2)
	const second = createOrder("Tristan", "tristan@example.com", 8, 1)
	console.log("two distinct orders have different ids:", order.id !== second.id)

	const logAll = (event: OrderEvent): void => {
		console.log("observer all:", event.type, "->", event.orderId)
	}
	const logClosed = (event: OrderEvent): void => {
		if (event.type === "OrderClosed") {
			console.log("observer closed:", event.orderId, "closed")
		}
	}
	const logCancelled = (event: OrderEvent): void => {
		if (event.type === "OrderCancelled") {
			console.log("observer cancelled:", event.orderId, "cancelled")
		}
	}

	order = subscribe(order, logAll)
	order = subscribe(order, logClosed)
	order = subscribe(order, logCancelled)

	order = addItem(order, 4, 1)
	console.log("after addItem status:", order.status, "quantity:", order.quantity, "total:", order.totalAmount)

	order = unsubscribe(order, logCancelled)

	order = closeOrder(order)
	console.log("after closeOrder status:", order.status)

	const secondClosed = closeOrder(second)
	console.log("second closed order status:", secondClosed.status)

	try {
		closeOrder(secondClosed)
		console.log("unexpected: double close accepted")
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.log("expected close error:", message)
	}

	const cancelled = cancelOrder(second)
	console.log("cancelled order status:", cancelled.status)

	try {
		addItem(order, 2, 1)
		console.log("unexpected: invalid state transition accepted")
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.log("expected state error:", message)
	}
}
