
import KeyboardKey from "./KeyboardKey";

function Keyboard()
{

    const keyRow1=['Q','W','E','R','T','Y','U','I','O','P'];
    const keyRow2=['A','S','D','G','H','J','K','L'];
    const keyRow3=['Z','X','C','V','B','N','M'];

    return (
        <div className="keyboard-container">
            <div className="base">
                <div className="line1">
                    {keyRow1.map(button=>{
                        return <KeyboardKey key={button} buttonKey={button}/>
                    })}
                </div>
                <div className="line2">
                    {keyRow2.map(button=>{
                        return <KeyboardKey key={button}  buttonKey={button}/>
                    })}
                </div>
                <div className="line3">
                    {keyRow3.map(button=>{
                        return <KeyboardKey key={button}  buttonKey={button}/>
                    })}
                </div>
            </div>
        </div>
    );
}

export default Keyboard;