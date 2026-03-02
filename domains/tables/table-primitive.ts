type Table = {
  id: string;
  tableNumber: number;
  capacity: number;
  isOccupied: boolean;
  isClean: boolean;
};

//Instances
const windowTable: Table = {
  id: "tab-01",
  tableNumber: 1,
  capacity: 4,
  isOccupied: false,
  isClean: true,
};

const boothTable: Table = {
  id: "tab-02",
  tableNumber: 12,
  capacity: 2,
  isOccupied: true,
  isClean: false,
};

function canAccommodate(table: Table, groupSize: number): boolean {
  return !table.isOccupied && table.isClean && table.capacity >= groupSize;
}

console.log("Can fit 3 people at Window Table?", canAccommodate(windowTable, 3));
console.log("Can fit 3 people at Booth Table?", canAccommodate(boothTable, 3));