export default function Rules({rulesBlockRef}) {
  const onCloseRulesClick = () => {
    rulesBlockRef.current.style.display = 'none';
  };

  return (
    <div className='rules' ref={rulesBlockRef}>
    <div className='rules-block'>
      <div className='close-btn-block'>
        <button className='close-btn' onClick={onCloseRulesClick}></button>
      </div>
      <div className='rules-text-block'>
        <p>Guess the order of famous persons from one, who was born earlier, to one, who was born later</p>
        <p>After each guess, the color of the tiles will change to show how close your guess was to the right order.</p>
        <p>Every day there are different persons</p>
      </div>
    </div>
  </div>
  )
}