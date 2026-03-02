type MenuItem = {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
  calories: number;
};

// Instances
const burger: MenuItem = {
  id: "item-001",
  name: "Classic Cheeseburger",
  price: 12.50,
  isAvailable: true,
  calories: 850,
};

const soup: MenuItem = {
  id: "item-002",
  name: "Tomato Soup",
  price: 6.00,
  isAvailable: false, // Out of stock
  calories: 250,
};

function getDiscountedPrice(item: MenuItem, discountPercent: number): number {
  return item.price * (1 - discountPercent / 100);
}

console.log(`${burger.name} sale price:`, getDiscountedPrice(burger, 10));