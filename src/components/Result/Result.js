import { useRef } from "react";
import Person from "../Person/Person";
import {CopyToClipboard} from 'react-copy-to-clipboard';

export default function Result({resultBlockRef, isWin, sortedPersons, attempt, resultToShare}) {
  const shareBtn = useRef(0);

  const onCloseResultClick = () => {
    resultBlockRef.current.style.display = 'none';
  };

  const onShareBtnCLick = () => {
    shareBtn.current.innerHTML = 'Copied!';
    shareBtn.current.style.backgroundColor = 'rgba(90, 244, 79, 0.5)';
  };

  return (
    <div className='result' ref={resultBlockRef}>
    <div className='result-block'>
      <div className='close-btn-block'>
        <button className='close-btn' onClick={onCloseResultClick}></button>
      </div>
      {
        isWin.get() ?
        <div>
          <h3>You won!!!</h3>
        </div>
        :
        <div>
          <h3>You lost</h3>
          <h4>Correct order is:</h4>
          <div>
            <ul className='game-row-list'>
              {
                sortedPersons.map(person=><Person data={person} key={person.id}/>)
              }
            </ul>
          </div>
        </div>
      }
      <div>
        <ul className='result-links-list'>
          {
            sortedPersons.map(person=>
              {
                return <li key={person.id}>
                  <a className='result-link' href={`https://pantheon.world/profile/person/${person.slug}`}>
                    {person.name} ({person.birthyear})
                  </a>
                </li>
              })
          }
        </ul>
      </div>
      <div>
        {
          isWin.get() ?
          <div>
            <CopyToClipboard text={`Pantheon ${attempt.get()+1}/6\n\n${resultToShare.get()}`} onCopy={onShareBtnCLick}>
              <button className='btn' ref={shareBtn}>Share</button>
            </CopyToClipboard>
          </div>
          : <></>
        }
        <div>
          <button className='btn' onClick={() => window.location.reload(false)}>Restart</button>
        </div>
      </div>
    </div>
  </div>
  )
}