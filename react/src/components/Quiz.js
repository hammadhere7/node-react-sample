import {useContext} from "react";
import GameContext from "../context/GameContext";
import QuizLetter from "./QuizLetter";

function Quiz()
{
    const gameInfo=useContext(GameContext);
    const letterArray=gameInfo.gameData.word.split("");

    return (
        <div className="quiz-container">
            {
                letterArray.map(letter=>{
                    return <QuizLetter key={Math.random() * (1000 - 100) + 100} isAnswered={gameInfo.gameData.correctKeys.includes(letter)} letter={letter}/>
                })
            }
        </div>
    )
}

export default  Quiz;