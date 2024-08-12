import {useContext} from "react";
import GameContext from "../context/GameContext";

function Header()
{
    const gameInfo=useContext(GameContext);
    const {score}=gameInfo.gameData;
    return (
        <>
            <div>
                <button className="restart-game" onClick={gameInfo.restartGame}>Restart Game</button>
                <p className="global-score">Score: <span>{score[0]}/{score[1]}</span></p>
            </div>
        </>
    );
}

export default Header;