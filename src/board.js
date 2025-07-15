import { createShip } from "./ship";

const createBoard = function () {
    const _board = [];
    for (let i = 0; i < 10; i++) {
        const row = [];
        for (let j = 0; j < 10; j++) {
            row.push({
                "attacked": false,
                "ship": null
            });
        }
        _board.push(row);
    }

    const _shipLengths = [5, 4, 3, 3, 2];

    const _ships = [
        createShip(_shipLengths[0], 0, 0, "RIGHT"),
        createShip(_shipLengths[1], 2, 0, "RIGHT"),
        createShip(_shipLengths[2], 4, 0, "RIGHT"),
        createShip(_shipLengths[3], 6, 0, "RIGHT"),
        createShip(_shipLengths[4], 8, 0, "RIGHT"),
    ];

    // Place the _ships on the actual board. Assume their positions are legal.
    const _placeShips = function () {
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                _board[row][col] = {
                    "attacked": false,
                    "ship": null
                };
            }
        }
        for (const [i, ship] of _ships.entries()) {
            for (let j = 0; j < ship.length; j++) {
                let row = ship.headRow;
                let col = ship.headCol;
                if (ship.direction === "RIGHT") col += j;
                else if (ship.direction === "DOWN") row += j;

                _board[row][col] = {
                    "attacked": false,
                    "ship": _ships[i]
                };
            }
        }
    }

    _placeShips()

    const getState = function () {
        const boardState = [];
        for (let i = 0; i < 10; i++) {
            const rowState = [];
            for (let j = 0; j < 10; j++) {
                const cell = _board[i][j]
                rowState.push({
                    "attacked": cell.attacked,
                    "hasShip": Boolean(cell.ship),
                    "sunk": cell.ship && cell.ship.isSunk()
                });
            }
            boardState.push(rowState);
        }
        return boardState;
    }

    const getShipState = function () {
        const shipState = [];
        for (const ship of _ships) {
            shipState.push({
                headRow: ship.headRow,
                headCol: ship.headCol,
                length: ship.length,
                direction: ship.direction
            });
        }
        return shipState;
    }

    const attackCell = function (row, col) {
        if (!_isValidTile(row, col) || _board[row][col].attacked) {
            return false;
        }
        _board[row][col].attacked = true;
        if (_board[row][col].ship) {
            _board[row][col].ship.hit();
        }
        return true;
    }

    // Returns whether all ships on this board have sunk
    const allSunk = function () {
        for (const ship of _ships) {
            if (!ship.isSunk()) {
                return false;
            }
        }
        return true;
    }

    // Arranges the board according to a setup. Returns if it's legal.
    // boardSetup = [
    //     {
    //         headRow: (int)
    //         headCol: (int)
    //         length: (int)
    //         direction: ("RIGHT", or "DOWN")
    //     },
    //     ...
    // ]
    const arrange = function (boardSetup) {
        // Board of falses where a ship can be placed, trues where one can't
        const dummyBoard = [];
        for (let i = 0; i < 10; i++) {
            const row = [];
            for (let j = 0; j < 10; j++) {
                row.push(false);
            }
            dummyBoard.push(row)
        }

        // Each length from 1-5 must appear exactly once
        for (const [i, ship] of boardSetup.entries()) {
            // Length is incorrect
            if (ship.length != _shipLengths[i]) {
                return false;
            }

            // Place the ships
            for (let j = 0; j < ship.length; j++) {
                let row = ship.headRow;
                let col = ship.headCol;
                if (ship.direction === "RIGHT") col += j;
                else if (ship.direction === "DOWN") row += j;
                else return false;
                
                // Can't put a ship here
                if (!_isValidTile(row, col) || dummyBoard[row][col]) {
                    return false;
                }   
            }
            
            // Block a 3x3 area around each ship cell
            for (let j = 0; j < ship.length; j++) {
                let row = ship.headRow;
                let col = ship.headCol;
                if (ship.direction === "RIGHT") col += j;
                else if (ship.direction === "DOWN") row += j;
                else return false;
                
                for (let k = -1; k < 2; k++) {
                    for (let l = -1; l < 2; l++) {
                        if (_isValidTile(row + k, col + l)) {
                            dummyBoard[row + k][col + l] = true;
                        }
                    }
                }
            }
        }

        // The arrangement is legal
        for (const [i, ship] of boardSetup.entries()) {
            const actualShip = _ships[i];
            actualShip.headCol = ship.headCol;
            actualShip.headRow = ship.headRow;
            actualShip.direction = ship.direction;
        }
        _placeShips();

        return true;
    }

    const _isValidTile = function (row, col) {
        return 0 <= row && row < 10 && 0 <= col && col < 10;
    }

    return {
        getState,
        getShipState,
        attackCell,
        allSunk,
        arrange
    }
}

export { createBoard };