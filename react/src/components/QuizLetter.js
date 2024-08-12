

function QuizLetter({letter,isAnswered})
{

    console.log('isAnswered',letter,isAnswered);
    return (
        <>
            {
                isAnswered?<p className="answered-letter">{letter.toUpperCase()}</p>:<p className="pending-letter">&nbsp;</p>
            }
        </>
    );
}

export default QuizLetter;