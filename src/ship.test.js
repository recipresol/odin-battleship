import { createShip } from "./ship.js"

test('3 length, 2 hits, not sunk', () => {
    const ship = createShip(3);
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(false);
});

test('3 length, 3 hits, sunk', () => {
    const ship = createShip(3);
    ship.hit();
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
});