const createShip = function (length, headRow, headCol, direction) {
    let _hits = 0;

    const hit = function () {
        _hits++;
    }

    const isSunk = function () {
        return _hits >= length;
    }

    return { 
        hit,
        isSunk,
        headRow,
        headCol,
        length,
        direction
    };
}

export { createShip };