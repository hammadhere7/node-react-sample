import {useContext} from "react";
import GameContext from "../context/GameContext";

function Man()
{
    const gameContext=useContext(GameContext);
    return (
        <>
            <div className="man-state">
                <img className={!gameContext.gameData.won&&!gameContext.gameData.gameRunning?'gallows':''} src={`assets/${gameContext.gameData.stateImage}`}/>
            </div>

        </>
    );
}

export default Man;