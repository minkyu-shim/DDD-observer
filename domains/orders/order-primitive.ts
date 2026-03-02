type Order = {
        id: string,
        customerName: string,
        totalAmount:number,
        isPaid: boolean,
        itemCount:number;
}

// Instance
const order1: Order = {
    id: "reservation-001",
    customerName: "Martin",
    totalAmount: 4,
    isPaid: false,
    itemCount: 6
}