import {useContext} from "react";
import GameContext from "../context/GameContext";

function Tries()
{

    const gameInfo=useContext(GameContext);
    const tries=gameInfo.gameData.tries;
    return (
        <>
            <p className="font-20">Tries Left: <span className="font-28"><strong>{tries}</strong></span></p>
        </>
    );
}

export default Tries;