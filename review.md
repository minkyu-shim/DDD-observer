# Code Feedback
This is a peer code review from Armand VIEAU.

## Todo list Validation

## Phase 1
The dependecies are well implemented, you can run the install without any issues, and the projects run flowlessly.

It is also good to note that the student structured their project in a clear and comprehensive way that makes it easier to review and edit.

## Phase 2
### Phase 2.a
> **Define** a plain object type using only `string`, `number`, and `boolean` fields  
> **Create** two or three instances of it with hardcoded values  
> **Write** a function that does something with those objects (e.g. calculates a total price, checks if a table is available)  

In `table-primitive.ts`, a Table type has been implemented with only string, number, and boolean as parameter type. Instances with hardcoded values are then created, and a `canAccommodate` function is created to check if a Table is available for use.  
All the requirements for Phase 2 are met, and are well implemented and tested.  

Even though the project evolved a lot since then, we can still observe other traces of this implementation.  
The Order type is here, and has parameters such as `customerName: string` or `readonly quantity: number`.

### Phase 2.b

> **Create** a type for `Order`. It accepts only primitives  

An Order type has been created in `order-primitive.ts`. Because the code changed a lot since this phase, most errors are now being treated with correct data types.

## Phase 3

> **Declare** a branded type for it  
> **Update** your object type to use `Price` instead of `number`  
> **Do** the same for at least one `string` field (e.g. `Email`, `TableId`, `ItemName`)  

In `branded-types.ts`, the Price type as well as Email is created as asked :
```ts
type Price = number & { readonly __brand: "Price" }
type Email = string & { readonly __brand: "Email" }
```
And now in Order, the given price and email are of the right type instead of just number and string:
```ts
readonly unitPrice: Price
readonly customerEmail: Email
```

Following the chosen implementation, the branded types are created and treated in a different files, and then exported onto the order-primitive files. This allows clearer design and easier fix in case a change needs to be made.

## Phase 4

> For each branded type from Phase 3:  
> -**Write** a factory function that accepts a raw primitive and returns the branded type  
> -**Throw** an error inside that function if the value breaks a business rule (e.g. price cannot be negative, email must contain `@`)  
> -**Replace** every direct object literal that sets those fields with a call to the factory function

Still inside of `branded-types.ts`, we implement a dictionnary that stores all of the factory function that will create our branded types.  
This allows us to call `toPrice` and `toEmail` whenever we want to create a Price or Email type :
```ts
const validUnitPrice = toOrderPrice(unitPrice)

return Domain.toPrice(value)
```

If the given value is wrong, the factory function will raise an Error :
```ts
if (!Number.isFinite(val)) throw new Error("Invalid Price: must be a finite number")
if (val < 0) throw new Error("Invalid Price: cannot be negative")
```

## Phase 5
> **Define** a type or interface that holds the related branded fields  
> **Write** a factory function (not a class constructor) that validates and returns an instance  
> **Add** a method or pure function that answers a domain question using only that object's data (e.g. `isOpen(hours, currentHour)`, `add(moneyA, moneyB)`)  
> **Make** the object immutable: all fields should be `readonly`, and any "update" should return a new object instead of mutating the existing one

The branded fields are correctly used for the Order type. A factory function, `createOrder`, has been implemented inside `order-primitive.ts` to create an Order with the right parameteres. A method to add an Item is also available using only that object's data. And finally, the object is immutable, using `readonly` for all the fiels, and returning a new object instead of creating a new one :
```ts
export type Order = {
	readonly id: OrderId
	readonly customerName: string
	readonly customerEmail: Email
    ...
}

export const addItem = (order: Order, unitPrice: number, quantity: number): Order => {
	
    ...
	const next: Order = {
		...order,
		unitPrice: validUnitPrice,
		quantity: order.quantity + validQuantity,
		totalAmount: newTotal,
		observers: order.observers,
	}
    ...

	return next
}
```

## Phase 6

> **Import** `uuid` and generate a unique `id` for each instance at creation time  
> **Brand** the id type  
> **Write** a factory function that creates the entity with its initial state and a fresh `id`  
> **Add** state-changing functions that return a **new** entity with the updated state rather than mutating the original  
> **Enforce** invariants inside those functions: throw if the requested change is not allowed (e.g. cannot add an item to a closed order)  

UUID is imported, and used inside the factory that creates the Order to enable a unique and automaticaly generated id for each Order. It is branded, and only created inside of a factory function :
```ts
const toOrderId = (): OrderId => {
	return `order-${uuidv4()}` as OrderId
}
```
This function is used inside of the factory function that creates the Order.  
As shown before, an `addItem` function is also implemented that lets you add an Item price to the Order, and returns a new object.  
In this `addItem` function, errors are thrown if the requested change is not allowed :
```ts
if (order.status !== "open") {
	throw new Error(`Cannot add item to an order with status ${order.status}`)
}
```

## Phase 7
### Phase 7.a
> **Define** what an observer looks like  
> **Define** the events your entity can emit — plain objects with a `type` field and a payload  

The observers are well defined, with multiple observers such as `ItemAdded`, `OrderClosed`, and `OrderCancelled`.  
A payload is associated with each of them, to send out more informations if needed :
```ts
{
    type: "ItemAdded"
    orderId: OrderId
    addedQuantity: number
    newQuantity: number
    total: Price
}
```
### Phase 7.b
> **Add** an `observers` field to your entity — it is an array of observer functions  
> **Write** a `subscribe` function that adds an observer to the list and returns the updated entity  
> **Write** an `unsubscribe` function that removes a specific observer from the list and returns the updated entity  

The Order object has the required `observers` field :
```ts
readonly observers: Array<Observer<OrderEvent>>
```
Both subscribe and unsubscribe functions have been correctly implemented, allowing connection or disconnection of multiple Observers to the Order.

### Phase 7.c
**Call** every observer in the list and pass the relevant event in each state-changing function from Phase 6, after computing the new state  
**Write** a `notify` helper that iterates the observers list and calls each one — keep it separate and reusable

The function is correctly implemented, and allows for the iteration and call of every active Observers:
```ts
const notify = (observers: Array<Observer<OrderEvent>>, event: OrderEvent): void => {
	for (let i = 0; i < observers.length; i++) {
		observers[i](event)
	}
}
```
We could argue that the way the function is written, if one observer crashes, it won't run the rest of the observers. This could be solved with a `try` / `catch`.

### Phase 7.d
The last phase is about testing, and doesn't really add anything new. Here, the student tests most edge cases with expected errors, and all the Observers logic works well.

Job done successfully !


## Remarks

### Price check
A `toPrice` function is made in `branded-types.ts` to create Price types, wich with other things checks if the number is a Finite number with the `isFinite` function :
```ts
toPrice: (val: number): Price => {
    if (!Number.isFinite(val)) throw new Error("Invalid Price: must be a finite number")
    if (val < 0) throw new Error("Invalid Price: cannot be negative")
    return val as Price
}
```
However, a `toOrderPrice` is created inside `order-primitive.ts`, wich does the following :
```ts
const toOrderPrice = (value: number): Price => {
	if (!Number.isFinite(value)) throw new Error("Invalid amount: must be a finite number")
	if (value <= 0) throw new Error("Invalid amount: must be greater than 0")
	return Domain.toPrice(value)
}
```
We can see that the `isFinite` function is ran twice, wich is useless because we are checking the same value.  
Moresoever, we can just check `value == 0` inside `toOrderPrice`, because `toPrice` already checks `value < 0`.

### Order structure - 1 item only
In the chosen Order structure, you can only put 1 type of item in an order.
You could have 7 "Big Burger", but you cannot have 1 "Big Burger" and 1 "Small Burger".  
This feels wrong, especially when you consider real restaurants or fast food places, where you might order multiple meals or items on the menu. In the current configuration, you would need to make different separate order for each item you wanna order, making the process anything but practical or intuitive.

### Order structure - No item name
When creating an Order, there is no mention of the item that is being ordered :
```ts
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
```
If 2 Items have the same price, they will not be differenciated, wich is a huge problem : what are the cooks supposed to prepare ?
This huge mistake leads to a complete failure of the restaurant's system, and should be fix ASAP.