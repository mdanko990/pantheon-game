export default function Header ({rulesBlockRef}) {
  const onRulesClick = () => {
    rulesBlockRef.current.style.display = 'block';
  };

  return (
    <header className='header'>
    <ul className='header-list'>
      <li>
        <button className='header-rules-btn' onClick={onRulesClick}></button>
      </li>
      <li>
        <h1 className='header-title'>
          Pantheon
        </h1>
      </li>
      <li>
        <button className='header-restart-btn' onClick={() => window.location.reload(false)}></button>
      </li>
    </ul>
  </header>
  )
}