import { v4 as uuidv4 } from "uuid"
import { Price } from "../branded-types.js"

export type Order = {
	id: string
	customerName: string
	customerEmail: string
	unitPrice: Price
	quantity: number
	totalAmount: number
	isPaid: boolean
}

export function runOrderPrimitiveDemo(): void {
	const orderOne: Order = {
		id: uuidv4(),
		customerName: "Martin",
		customerEmail: "martin@example.com",
		unitPrice: 12.5 as Price,
		quantity: 2,
		totalAmount: 25,
		isPaid: true,
	}

	const orderTwo: Order = {
		id: uuidv4(),
		customerName: "Tristan",
		customerEmail: "tristan@example.com",
		unitPrice: -8 as Price, // silent bug
		quantity: 1,
		totalAmount: -8,
		isPaid: true,
	}

	const orderThree: Order = {
		id: uuidv4(),
		customerName: "Maxim",
		customerEmail: "maxim@example.com",
		unitPrice: 14 as Price,
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
}
