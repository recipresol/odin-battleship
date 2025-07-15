const createHumanPlayer = function () {
    let _controller = null;

    let shipBeingPlaced = null;
    let placementRowOffset = 0;
    let placementColOffset = 0;
    let setup = false;
    
    const leftBoardElement = document.getElementById("left-board");
    const rightBoardElement = document.getElementById("right-board");

    const leftGridElement = document.getElementById("left-grid");
    const rightGridElement = document.getElementById("right-grid");

    const leftBoard = [];
    const rightBoard = [];

    const shipsBoard = [];

    const ships = [null, null, null, null, null];

    const joinGame = function (game) {
        _controller = game.getController();
        if (_controller) {
            _controller.setNotifyCallback(_notify);
            _controller.readyController();
        }
        _initUI();
    }

    // What to do when the game notifies the player
    const _notify = function (message, data) {
        if (
            message === "SETUP" ||
            message === "VALID" ||
            message === "INVALID"
        ) {                         // Signal to set up the board
            setup = true;
            shipBeingPlaced = null;
            for (let i = 0; i < ships.length; i++) {
                ships[i] = data[i];
            }
            _updateSetupUI();
        } else {
            setup = false;
            if (
                message === "TURN" || 
                message === "END TURN" ||
                message === "VICTORY" ||
                message == "DEFEAT"
            ) {
                _updateGameUI(data);
            }
        }
    }

    // Redraw the board during setup
    const _updateSetupUI = function () {
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                shipsBoard[row][col] = null;
                leftBoard[row][col].className = "cell";
            }
        }
        for (const ship of ships) {
            if (ship !== shipBeingPlaced) {
                _drawShip(ship, "cell ship");
            }
        }
        if (shipBeingPlaced) {
            _drawShip(shipBeingPlaced, "cell placing");
        }
    }

    const _drawShip = function (ship, className) {
        for (let j = 0; j < ship.length; j++) {
            let row = ship.headRow;
            let col = ship.headCol;
            if (ship.direction === "RIGHT") col += j;
            else if (ship.direction === "DOWN") row += j;

            if (0 <= row && row < 10 && 0 <= col && col < 10) {
                shipsBoard[row][col] = ship;
                leftBoard[row][col].className = className;
            }
        }
    }

    // Redraw the board each turn during the game
    const _updateGameUI = function (data) {
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                _updateCell(data.ownBoard[row][col], leftBoard[row][col]);
                _updateCell(data.opponentBoard[row][col], rightBoard[row][col]);
            }
        }
    }

    const _updateCell = function (cell, element) {
        if (typeof(cell) === "string") {
            if (cell === "FOG") {
                element.className = "cell foggy";
            } else if (cell === "MISS") {
                element.className = "cell attacked";
            } else if (cell === "HIT") {
                element.className = "cell attacked ship";
            } else if (cell === "SUNK") {
                element.className = "cell attacked ship sunk";
            }
        } else {
            element.classList.remove("foggy");
            if (cell.hasShip) {
                element.classList.add("ship")
            }
            if (cell.sunk) {
                element.classList.add("sunk")
            }
            if (cell.attacked) {
                element.classList.add("attacked")
            }
        }
    }

    const _createEdgeElement = function (innerText) {
        const edge = document.createElement("div");
        edge.className = "edge";
        edge.innerText = innerText;
        return edge;
    }

    const _createCellElement = function () {
        const cell = document.createElement("div");
        cell.className = "cell";

        const peg = document.createElement("peg");
        peg.className = "peg";
        cell.appendChild(peg);

        return cell;
    }

    // Convert a base cell into an opponent cell
    const _makeOpponentCell = function (cell, row, col) {
        cell.classList.add("foggy");
        cell.addEventListener("click", () => {
            _controller.attack(row, col);
        })
    }

    // Convert a base cell into a player cell
    const _makePlayerCell = function (cell, row, col) {
        cell.addEventListener("click", () => {
            if (setup) {
                if (shipBeingPlaced) {
                    shipBeingPlaced = null;
                    _controller.setBoard(ships);
                } else {
                    shipBeingPlaced = shipsBoard[row][col];
                    if (shipBeingPlaced) {
                        placementRowOffset = shipBeingPlaced.headRow - row;
                        placementColOffset = shipBeingPlaced.headCol - col;
                        _updateSetupUI();
                    }
                }
            }
        });
        cell.addEventListener("contextmenu", (e) => {
            if (setup) {
                if (shipBeingPlaced) {
                    e.preventDefault();
                    if (shipBeingPlaced.direction === "RIGHT") {
                        shipBeingPlaced.direction = "DOWN";
                    } else if (shipBeingPlaced.direction === "DOWN") {
                        shipBeingPlaced.direction = "RIGHT";
                    }
                    let temp = placementColOffset;
                    placementColOffset = placementRowOffset;
                    placementRowOffset = temp;
                    shipBeingPlaced.headRow = row + placementRowOffset;
                    shipBeingPlaced.headCol = col + placementColOffset;
                    _updateSetupUI();
                }
            }
        })
        cell.addEventListener("mouseenter", () => {
            if (setup) {
                if (shipBeingPlaced) {
                    shipBeingPlaced.headRow = row + placementRowOffset;
                    shipBeingPlaced.headCol = col + placementColOffset;
                    _updateSetupUI();
                }
            }
        });
    }

    const _initUI = function () {
        // Clear the UI
        leftBoardElement.innerHTML = "";
        rightBoardElement.innerHTML = "";

        // The main grid
        const leftGridElement = document.createElement("div");
        leftGridElement.id = "left-grid";
        leftBoardElement.appendChild(leftGridElement);
        const rightGridElement = document.createElement("div");
        rightGridElement.id = "right-grid";
        rightBoardElement.appendChild(rightGridElement);

        // Empty corners
        leftBoardElement.appendChild(_createEdgeElement(""));
        rightBoardElement.appendChild(_createEdgeElement(""));

        // Column indicators
        for (let i = 0; i < 10; i++) {
            leftBoardElement.appendChild(_createEdgeElement(`${i + 1}`));
            rightBoardElement.appendChild(_createEdgeElement(`${i + 1}`));
        }

        // Row indicators
        for (let i = 0; i < 10; i++) {
            leftBoardElement.appendChild(_createEdgeElement("ABCDEFGHIJ".charAt(i)));
            rightBoardElement.appendChild(_createEdgeElement("ABCDEFGHIJ".charAt(i)));
        }

        // Game cells and ships board
        for (let i = 0; i < 10; i++) {
            const leftRow = [];
            const rightRow = [];
            const shipsRow = [];
            for (let j = 0; j < 10; j++) {
                leftRow.push(_createCellElement());
                _makePlayerCell(leftRow[j], i, j);
                leftGridElement.appendChild(leftRow[j]);
                rightRow.push(_createCellElement());
                rightGridElement.appendChild(rightRow[j]);
                shipsRow.push(null);
            }
            leftBoard.push(leftRow);
            rightBoard.push(rightRow);
            shipsBoard.push(shipsRow);
        }

        // Play button
        const readyButton = document.createElement("button");
        readyButton.id = "ready-button";
        readyButton.innerText = "Ready";
        leftBoardElement.appendChild(readyButton);
        readyButton.addEventListener("click", () => {
            if (setup) {
                for (let i = 0; i < 10; i++) {
                    for (let j = 0; j < 10; j++) {
                        _makeOpponentCell(rightBoard[i][j], i, j);
                    }
                }
                _controller.readyBoard();
            }
        });

        // Reset button
        const resetButton = document.createElement("button");
        resetButton.id = "reset-button";
        resetButton.innerText = "Reset";
        leftBoardElement.appendChild(resetButton);
    }

    return {
        joinGame
    };
}

export { createHumanPlayer };