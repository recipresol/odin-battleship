import { createBoard } from "./board";

const createGame = function () {
    let _status = "JOINING";
    let _activePlayerHandler = null;

    const _createPlayerHandler = function () {
        let _notifyCallback = (gameState) => {};
        const notify = function (message, data) {
            _notifyCallback(message, data);
        }

        const self = {
            controller: null,
            controllerGiven: false,
            controllerReady: false,
            board: createBoard(),
            boardReady: false,
            opponent: null,
            notify
        }

        const controller = {
            setNotifyCallback: (callback) => _notifyCallback = callback,
            readyController: () => _readyController(self),
            readyBoard: () => _readyBoard(self),
            setBoard: (boardSetup) => _setBoard(self, boardSetup),
            attack: (row, col) => _attack(self, row, col)
        }

        self.controller = controller;

        return self;
    }

    const _playerHandlers = [
        _createPlayerHandler(), 
        _createPlayerHandler()
    ];
    _playerHandlers[0].opponent = _playerHandlers[1];
    _playerHandlers[1].opponent = _playerHandlers[0];

    // Returns a controller, if there are any available
    const getController = function () {
        if (!_playerHandlers[0].controllerGiven) {
            _playerHandlers[0].controllerGiven = true;
            return _playerHandlers[0].controller;
        } else if (!_playerHandlers[1].controllerGiven) {
            _playerHandlers[1].controllerGiven = true;
            return _playerHandlers[1].controller;
        } else {
            return null;
        }
    }

    // What to do when a player signals their controller is ready
    const _readyController = function (playerHandler) {
        if (_status === "JOINING") {
            playerHandler.controllerReady = true;
            _checkControllers();
        }
    }

    // Checks if controllers are connected, then begins setup
    const _checkControllers = function () {
        if (_status === "JOINING" && _playerHandlers[0].controllerReady && _playerHandlers[1].controllerReady) {
            _status = "SETUP";
            _playerHandlers[0].notify("SETUP", _playerHandlers[0].board.getShipState());
            _playerHandlers[1].notify("SETUP", _playerHandlers[1].board.getShipState());
        }
    }

    // What to do when a player signals their board is ready
    const _readyBoard = function (playerHandler) {
        if (_status === "SETUP") {
            playerHandler.boardReady = true;
            _checkBoards();
        }
    }

    // Checks if everyone's boards are ready, then starts the game
    const _checkBoards = function () {
        if (_status === "SETUP" && _playerHandlers[0].boardReady && _playerHandlers[1].boardReady) {
            _status = "GAME";
            _giveTurn(_playerHandlers[0]);
        }
    }

    // What to do when a player sends their board setup
    const _setBoard = function (playerHandler, boardSetup) {
        if (_status === "SETUP" && !playerHandler.boardReady) {
            if (playerHandler.board.arrange(boardSetup)) {
                playerHandler.notify("VALID", playerHandler.board.getShipState());
            } else {
                playerHandler.notify("INVALID", playerHandler.board.getShipState());
            }
        }
    }

    // What to do when a player makes an attack
    const _attack = function (playerHandler, row, col) {
        if (_status === "GAME") {
            if (_activePlayerHandler === playerHandler) {
                if (playerHandler.opponent.board.attackCell(row, col)) {
                    if (_hasWon(playerHandler)) {
                        _win(playerHandler);
                    }
                    else {
                        _giveTurn(playerHandler.opponent);
                    }
                }
                else {
                    _giveTurn(playerHandler);
                }
            }
        }
    }

    // Hands the turn off to a player
    const _giveTurn = function (playerHandler) {
        _activePlayerHandler = playerHandler;
        playerHandler.opponent.notify("END TURN", {
            "ownBoard": playerHandler.opponent.board.getState(),
            "opponentBoard": _concealBoard(playerHandler.board.getState())
        });
        playerHandler.notify("TURN", {
            "ownBoard": playerHandler.board.getState(),
            "opponentBoard": _concealBoard(playerHandler.opponent.board.getState())
        });
    }

    // Checks if a player has won
    const _hasWon = function (playerHandler) {
        return playerHandler.opponent.board.allSunk();
    }

    // Ends the game in favor of a player
    const _win = function (playerHandler) {
        _status = "GAMEOVER";
        playerHandler.notify("VICTORY", {
            "ownBoard": playerHandler.board.getState(),
            "opponentBoard": playerHandler.opponent.board.getState()
        });
        playerHandler.opponent.notify("DEFEAT", {
            "ownBoard": playerHandler.opponent.board.getState(),
            "opponentBoard": playerHandler.board.getState()
        });
    }

    // Partially hides a full board state for the other player
    const _concealBoard = function (boardState) {
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                const cell = boardState[i][j];
                boardState[i][j] =
                    !cell.attacked ? "FOG" : 
                    !cell.hasShip ? "MISS" :
                    !cell.sunk ? "HIT" : "SUNK";
            }
        }
        return boardState;
    }

    return {
        getController
    };
}

export { createGame };