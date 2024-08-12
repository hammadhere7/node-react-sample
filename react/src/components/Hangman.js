import Keyboard from "./Keyboard";
import Quiz from "./Quiz";
import Man from "./Man";
import GameContext from "../context/GameContext";
import {useState} from "react";
import UserAction from "../helpers/UserAction";
import Header from "./Header";
import Selections from "./Selections";
import Tries from "./Tries";
import Outcome from "./Outcome";

function Hangman()
{
    const [gameData,setGameData]=useState(UserAction.getInitialState());

    function setItem(key,value)
    {
        let gameState={...gameData};
        gameState=UserAction.reduceTries(gameState,value);
        gameState=UserAction.savePressedKey(gameState,value);
        gameState=UserAction.saveAnswer(gameState,value);
        gameState=UserAction.hasAnsweredEveryLetter(gameState);
        gameState=UserAction.getStateImage(gameState);
        return setGameData(()=>gameState);
    }

    function restartGame()
    {
        let gameState={...gameData};
        gameState=UserAction.getInitialState();
        return setGameData(()=>gameState);
    }

    const contextData={gameData, setItem, restartGame};

    return (
        <>
            <GameContext.Provider value={contextData}>
                <Header/>
                <Man/>
                <div className="game-container">

                    <Quiz/>
                    <Outcome/>
                    <Tries/>
                    <Keyboard/>
                    <Selections/>
                </div>
            </GameContext.Provider>
        </>


    );
}

export default Hangman;