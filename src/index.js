import "./styles.css";
import { createGame } from "./game";
import { createHumanPlayer } from "./player";
import { createComputerPlayer } from "./computer";

const reset = function () {
    const game = createGame();
    const human = createHumanPlayer();
    const computer = createComputerPlayer();
    human.joinGame(game);
    computer.joinGame(game);
    document.getElementById("reset-button").addEventListener("click", reset);
}

reset();