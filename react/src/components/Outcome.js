import {useContext} from "react";
import GameContext from "../context/GameContext";

function Outcome()
{
    const gameInfo=useContext(GameContext);
    const {gameRunning,won}=gameInfo.gameData;

    return (
        <>
            {
                !gameRunning?won?<p className="font-28 game-won">You Won</p>:<p className="font-28 game-lost">You Lost</p>:''
            }

            {
                !gameRunning?<button className="restart-game" onClick={gameInfo.restartGame}>Play Again</button>:''
            }

        </>
    );
}

export default Outcome;