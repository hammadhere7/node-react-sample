function SelectionKey({selectedKey,correct})
{
    return (
        <>
            <p className={correct?'selected-key correct-selection':'selected-key wrong-selection'}>{selectedKey.toUpperCase()}</p>
        </>
    );
}

export default SelectionKey;