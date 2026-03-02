import { v4 as uuidv4 } from "uuid"
import { Price, Email, Domain } from "../branded-types.js"

export type Order = {
	id: string
	customerName: string
	customerEmail: Email
	unitPrice: Price
	quantity: number
	totalAmount: number
	isPaid: boolean
}

export function runOrderPrimitiveDemo(): void {
	const orderOne: Order = {
		id: uuidv4(),
		customerName: "Martin",
		customerEmail: Domain.toEmail("martin@example.com"),
		unitPrice: Domain.toPrice(12.5),
		quantity: 2,
		totalAmount: 25,
		isPaid: true,
	}

	const orderTwo: Order = {
		id: uuidv4(),
		customerName: "Tristan",
		customerEmail: Domain.toEmail("tristan@example.com"),
		unitPrice: Domain.toPrice(8),
		quantity: 1,
		totalAmount: 8,
		isPaid: true,
	}

	const orderThree: Order = {
		id: uuidv4(),
		customerName: "Maxim",
		customerEmail: Domain.toEmail("maxim@example.com"),
		unitPrice: Domain.toPrice(14),
		quantity: -3, // silent bug 002
		totalAmount: -42,
		isPaid: false,
	}

	const orders = [orderOne, orderTwo, orderThree]
	console.log("phase 2 / order primitive draft")
	console.log(orders)

	for (let i = 0; i < orders.length; i++) {
		const o = orders[i]
		const calc = o.unitPrice * o.quantity
		console.log("calc total for", o.id, "=>", calc)
	}

	let paidRevenue = 0
	for (let i = 0; i < orders.length; i++) {
		if (orders[i].isPaid) paidRevenue += orders[i].totalAmount
	}
	console.log("paid revenue (can be wrong because data can be wrong):", paidRevenue)

	// same primitive type => easy to swap by accident
	const formatContact = (name: string, email: string): string => name + " <" + email + ">"
	console.log("normal:", formatContact(orderOne.customerName, orderOne.customerEmail))
	console.log("swapped args silent bug:", formatContact(orderOne.customerEmail, orderOne.customerName))

	console.log("phase 4: invalid constructor input should throw")
	try {
		Domain.toPrice(-8)
		console.log("unexpected: invalid price was accepted")
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.log("expected price error:", message)
	}

	try {
		Domain.toEmail("not-an-email")
		console.log("unexpected: invalid email was accepted")
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.log("expected email error:", message)
	}
}
