const createComputerPlayer = function () {
    let _controller = null;

    const joinGame = function (game) {
        _controller = game.getController();
        if (_controller) {
            _controller.setNotifyCallback(_notify);
            _controller.readyController();
        }
    }
    
    // What to do when the game notifies the player
    const _notify = function (message, data) {
        if (message === "SETUP" || message === "INVALID") {
            _controller.setBoard(_randomBoard());
        } else if (message === "VALID") {
            _controller.readyBoard();
        } else if (message === "TURN") {
            setTimeout(() => {
                let moveSet = []
                for (let row = 0; row < 10; row++) {
                    for (let col = 0; col < 10; col++) {
                        if (data.opponentBoard[row][col] === "FOG") {
                            // Disqualify targets adjacent to sunk ships
                            let sunkAdjacent = false;
                            for (let i = -1; i < 2; i++) {
                                for (let j = -1; j < 2; j++) {
                                    if (_isValidTile(row + i, col + j)) {
                                        sunkAdjacent ||= data.opponentBoard[row + i][col + j] === "SUNK"
                                    }
                                }
                            }
                            if (!sunkAdjacent) {
                                moveSet.push({row, col});
                            }
                        } else if (data.opponentBoard[row][col] === "HIT") {
                            const adjacencies = [];
                            const hit = (row, col) => _isValidTile(row, col) && data.opponentBoard[row][col] === "HIT";
                            const targetable = (row, col) => _isValidTile(row, col) && data.opponentBoard[row][col] === "FOG";
                            // Walk down a direction until you run out of hit tiles. See if it's a good target.
                            const walk = (row, col, dRow, dCol) => {
                                while (hit(row, col)) {
                                    row += dRow;
                                    col += dCol;
                                }
                                return targetable(row, col) ? {row, col} : null;
                            }
                            
                            // Directional adjacencies?
                            if (hit(row, col - 1) || hit(row, col + 1)) {
                                if (walk(row, col, 0, -1)) adjacencies.push(walk(row, col, 0, -1));
                                if (walk(row, col, 0, 1)) adjacencies.push(walk(row, col, 0, 1));
                            } else if (hit(row - 1, col) || hit(row + 1, col)) {
                                if (walk(row, col, -1, 0)) adjacencies.push(walk(row, col, -1, 0));
                                if (walk(row, col, 1, 0)) adjacencies.push(walk(row, col, 1, 0));
                            } else {    // No adjacencies
                                if (targetable(row - 1, col)) adjacencies.push({row: row - 1, col});
                                if (targetable(row + 1, col)) adjacencies.push({row: row + 1, col});
                                if (targetable(row, col - 1)) adjacencies.push({row, col: col - 1});
                                if (targetable(row, col + 1)) adjacencies.push({row, col: col + 1});
                            }

                            // Break if good moves are found
                            if (adjacencies.length > 0) {
                                moveSet = adjacencies;
                                row = 10;
                                col = 10;
                            }
                        }
                    }
                }

                const randomIndex = Math.floor(Math.random() * moveSet.length);
                const move = moveSet.splice(randomIndex, 1)[0]
                _controller.attack(move.row, move.col);
            }, 1000);
        }
    }

    const _isValidTile = function (row, col) {
        return 0 <= row && row < 10 && 0 <= col && col < 10;
    }

    // Generate a random board setup that may or may not be legal
    const _randomBoard = function () {
        const ships = [{length: 5}, {length: 4}, {length: 3}, {length: 3}, {length: 2}];
        for (const ship of ships) {
            if (Math.random() >= 0.5) {
                ship.headRow = Math.floor(Math.random() * 10);
                ship.headCol = Math.floor(Math.random() * (10 - ship.length + 1));
                ship.direction = "RIGHT";
            } else {
                ship.headRow = Math.floor(Math.random() * (10 - ship.length + 1));
                ship.headCol = Math.floor(Math.random() * 10);
                ship.direction = "DOWN";
            }
        }
        return ships;
    }

    return {
        joinGame
    };
}

export { createComputerPlayer };