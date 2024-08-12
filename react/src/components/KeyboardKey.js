import PlayerActions from "../PlayerActions";
import {useContext} from "react";
import GameContext from "../context/GameContext";

function KeyboardKey({buttonKey})
{
    const gameInfo=useContext(GameContext);


    function playSound()
    {
        const audio=new Audio('assets/keypress.mp3');
        audio.play();
    }
    function onKeyClick(e){
        let key=e.target.innerText.toLowerCase();
        playSound();
        gameInfo.setItem(PlayerActions.KEY_PRESS,key);

    }

    let disabled=gameInfo.gameData.pressedKeys.includes(buttonKey.toLowerCase());
    if(!gameInfo.gameData.gameRunning)
        disabled=true;

    return (
        <>
            <audio src={'assets/keypress.mp3'}/>
            <span className={disabled?'disabled-key':''} onClick={disabled?undefined: onKeyClick}>{buttonKey}</span>
        </>
    );
}

export default KeyboardKey;