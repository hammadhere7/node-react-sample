import {useContext} from "react";
import GameContext from "../context/GameContext";
import SelectionKey from "./SelectionKey";

function Selections()
{
    const gameInfo=useContext(GameContext);

    return (
        <>
            <div className="answer-container mt-lg">
                Correct:
                {gameInfo.gameData.correctKeys.map(correctKey=>{
                    return <SelectionKey selectedKey={correctKey} correct={true}/>
                })}
            </div>

            <div className="answer-container">
                Incorrect:
                {gameInfo.gameData.wrongKeys.map(correctKey=>{
                    return <SelectionKey selectedKey={correctKey} correct={false}/>
                })}
            </div>

        </>
    );
}


export default Selections;