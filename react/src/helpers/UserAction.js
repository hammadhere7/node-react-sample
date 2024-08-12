import randomWord from "random-words";

const UserAction={
    reduceTries: (gameState,key)=> {
        const wordArray=gameState.word.split("");
        if(wordArray.indexOf(key)===-1)
            gameState.tries--;
        if(gameState.tries===0)
            gameState.gameRunning=false;
        return gameState;
    },
    savePressedKey: (gameState,key)=>{
        gameState.pressedKeys.push(key);
        return gameState;
    },
    saveAnswer: (gameState,key)=>{
        if(gameState.word.indexOf(key)>-1)
            gameState.correctKeys.push(key);
        else
            gameState.wrongKeys.push(key);

        return gameState;
    },
    getInitialState: ()=>{
        return {
            word: randomWord(),
            tries: 7,
            pressedKeys: [],
            correctKeys: [],
            wrongKeys: [],
            gameRunning: true,
            won: false,
            score: UserAction.getScoreData(),
            stateImage: 'hangman0.png'
        };
    },
    hasAnsweredEveryLetter: (gameState)=>{
        let wordArray=gameState.word.split("");
        let response=true;
        wordArray.forEach(letter=>{
            if(!gameState.correctKeys.includes(letter))
                response=false;
        });

        if(response)
        {
            gameState.won=true;
            gameState.gameRunning=false;
        }
        gameState=UserAction.updateLocalStorage(gameState);
        return gameState;
    },
    getScoreData: ()=>{
        let item=localStorage.getItem('hangman_score');
        if(item===null)
            return [0,0];
        else
        {
            let score=JSON.parse(item);
            return score;
        }
    },
    updateLocalStorage: (gameState)=>{
        if(!gameState.gameRunning)
        {
            let score=UserAction.getScoreData();
            if(gameState.won)
            {
                score[0]=score[0]+1;
                UserAction.playSound('assets/yeah.mp3');
            }
            else
                UserAction.playSound('assets/gallows.mp3');


            score[1]=score[1]+1;
            gameState.score=score;
            localStorage.setItem('hangman_score',JSON.stringify(score));
        }
        return gameState;
    },
    playSound: (path)=>{
        const audio=new Audio(path);
        audio.play();
    },
    getStateImage: (gameStage)=>{
        switch (gameStage.tries)
        {
            case 0:
                gameStage.stateImage='hangman6.png';
                return gameStage;
            case 1:
            case 2:
                gameStage.stateImage='hangman5.png';
                return gameStage;
            case 3:
                gameStage.stateImage='hangman4.png';
                return gameStage;
            case 4:
                gameStage.stateImage='hangman3.png';
                return gameStage;
            case 5:
                gameStage.stateImage='hangman2.png';
                return gameStage;
            case 6:
                gameStage.stateImage='hangman1.png';
                return gameStage;
            case 7:
                gameStage.stateImage='hangman0.png';
                return gameStage;

        }
    }
};

export default UserAction;