import { useEffect, useRef, useState } from 'react';
import './App.css';

const N_PERSONS = 5;
const MAX_ATTEMPTS = 6;

const boardCellDefault = {
  person: null,
  isCorrect: false
};

const boardDefault = (() =>{
  return Array.from({ length:MAX_ATTEMPTS }, () => (
    Array.from({ length:N_PERSONS }, () => boardCellDefault)
  ));
})();

function useTrait(initialValue) {
  const [trait, updateTrait] = useState(initialValue);

  let current = trait;
  const get = () => current;
  const set = newValue => {
    current = newValue;
    updateTrait(newValue);
    return current;
  };

  return {
    get,
    set,
  };
}

function Person({data, onClick, isBoardItem}) {
  const [imgURL, setImgURL] = useState(data.imgURL);

  useEffect(()=>{
    const img = new Image();
    img.src = data.imgURL;

    img.onerror = () => {
      setImgURL('https://pantheon.world/images/icons/icon-person.svg');
    };
  });

  return(
    <li className='game-row-list-item' key={data.id} onClick={onClick}>
    <div className={`card ${isBoardItem?'board-item':''}`} id={data.id}>
      <img className='card-image' src={imgURL} alt={`Photo of ${data.name}`}/>
      {
      !isBoardItem ?
      <div className='card-title'>{data.name}</div>
      :
      <></>
      }
    </div>
  </li>
  )
}

function App() {
  const [persons, setPersons] = useState([]);
  const [sortedPersons, setSortedPersons] = useState([]);
  
  const fetchError = useTrait(false);
  const selectedPersons = useTrait([]);
  const board = useTrait(boardDefault);
  const personPos = useTrait(0);
  const attempt = useTrait(0);
  const isWin = useTrait(false);

  const boardRef = useRef(0);
  const resultBlockRef = useRef(0);
  const rulesBlockRef = useRef(0);
  const cancelLastBtnRef = useRef(0);
  const checkBtnRef = useRef(0);

  const getRandomIndex = (arr, max) => {
    const index = Math.floor(Math.random() * max);

    if (!arr.includes(index)) {
      return index;
    } else {
      getRandomIndex(arr, max);
    }
  }

  const fetchData = async () => {
    return await fetch('https://api.pantheon.world/person?hpi=gt.80')
    .then(res => res.json())
    .then(data => {
      const length = data.length;
      let persons = [];
      let indexes = [];

      while (persons.length < N_PERSONS){
        const index = getRandomIndex(indexes, length);
        const person = {
          id: data[index].id,
          name: data[index].name,
          slug: data[index].slug,
          birthdate: data[index].birthdate,
          birthyear: data[index].birthyear,
          imgURL: `https://pantheon.world/images/profile/people/${data[index].id}.jpg`,
          selected: false
        };
        indexes.push(index);
        persons.push(person);  
      }
      
      setPersons(persons);
      
      setSortedPersons(() => {
          return [...persons].sort((a, b) => {
            if (a.birthyear===b.birthyear) {
              const dateA = new Date(a.birthdate);
              const dateB = new Date();

              return dateA - dateB;
            }
            
            return a.birthyear - b.birthyear;
          });
        }
      );  
    });
  };

  const findPerson = (id) => {
    const person = persons.find(person => person.id === id);
    return person;
  };

  const onCheckClick = () => {
    const newPersons = [...persons];

    newPersons.forEach(person => person.selected = false);
    setPersons(newPersons);

    const cells = document.querySelectorAll('.card');
    let newBoard = [...board.get()];
    let correctPersons = []

    newBoard[attempt.get()].map((cell, i) => {
      if (selectedPersons.get()[i].id === sortedPersons[i].id) {
        cell.isCorrect = true;
        correctPersons.push(true);
        cells[N_PERSONS*attempt.get()+i].className = 'card correct';
      } else {
        correctPersons.push(false);
        cells[N_PERSONS*attempt.get()+i].className = 'card wrong';
      };
    })

    isWin.set(correctPersons.every(el => el === true));
    
    if (isWin.get()) {
      resultBlockRef.current.style.display = 'block';
    } else if (attempt.get() === MAX_ATTEMPTS - 1) {
      resultBlockRef.current.style.display = 'block';
    } else {
      board.set(newBoard);
      personPos.set(0);
      attempt.set(attempt.get()+1);
      selectedPersons.set([]);
    }
    
    checkBtnRef.current.disabled = true;
    cancelLastBtnRef.current.disabled = true;
  };

  const selectPerson = (person) => {
    let newBoard = [...board.get()];
    
    newBoard[attempt.get()][personPos.get()] = {person: person, isCorrect: false};
    newBoard[attempt.get()][personPos.get()].person.selected = true;
    board.set(newBoard);
    
    selectedPersons.set([...selectedPersons.get(), person]);
  }

  const onPersonClick = (event) => {
    const id = event.target.parentNode.id;
    const person = findPerson(id);
    
    if (personPos.get() < N_PERSONS) {
      if (person.selected === false) {
        selectPerson(person);
        personPos.set(personPos.get()+1);
      }
    }
    
    if (personPos.get() > N_PERSONS - 1) checkBtnRef.current.disabled = false;
    
    cancelLastBtnRef.current.disabled = false;
  };

  const onCancelLastClick = () => {
    const id = selectedPersons.get()[selectedPersons.get().length-1].id;
    const newBoard = board.get();
    
    newBoard[attempt.get()][personPos.get()-1] = boardCellDefault;
    
    const newPersons = persons.map(person => {
      if (person.id === id) person.selected=false;
      
      return person;
    })

    setPersons(newPersons);

    const newSelectedPersons = selectedPersons.get();
    
    newSelectedPersons.pop();
    selectedPersons.set(newSelectedPersons);

    personPos.set(personPos.get() - 1);
    
    if (+personPos.get() === 0) {
      cancelLastBtnRef.current.disabled = true;
    }
  }

  const onCloseRulesClick = () => {
    rulesBlockRef.current.style.display = 'none';
  }

  const onRulesClick = () => {
    rulesBlockRef.current.style.display = 'block';
  }

  const onCloseResultClick = () => {
    resultBlockRef.current.style.display = 'none';
  }

  useEffect(()=>{
    board.set(boardDefault);
    selectedPersons.set([]);
    setSortedPersons([]);
    checkBtnRef.current.disabled = true;
    cancelLastBtnRef.current.disabled = true;
    fetchData()
    .catch((err) => {
      fetchError.set(true);
    });
  },[]);

  return (    
    <div>
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
      <main className='main'>
        <div className='game'>
          <div className='game-header'>
            <h2 className='game-name'>Who was born first?</h2>
          </div>
          <div className='game-main'>
            <div className='game-board' ref={boardRef}>
              {
                <ul>
                {
                  board.get().map((row, i) => 
                    <li key={i}>
                      <ul className='game-row-list'>
                        {
                          row.map((cell, j) => {
                            if(cell.person === null) {
                              return <li className='game-row-list-item' key={j}>
                                <div className='card board-item'></div>
                              </li>
                            } else {
                              return <Person data={cell.person} isBoardItem={true} key={cell.person.id}/>
                            }
                          })
                        }
                      </ul>
                    </li>
                  )
                }
                </ul>
              }
            </div>
            <div className='game-control'>
              { 
                !fetchError.get() ?
                persons.length > 0 ?
                <div className='game-row'>
                  <ul className='game-row-list column'>
                    {
                      persons.map(person =>
                        <Person data={person} onClick={onPersonClick} isBoardItem={false} key={person.id}/>
                      )
                    }
                  </ul>
                </div>
                :
                <div className='error-block'>Loading...</div>
                :
                <div className='error-block'>Try to reload game later</div>
              }
              <div className='btn-list'>
                <button className='btn' ref={checkBtnRef} onClick={onCheckClick}>Check</button>
                <button className='btn' ref={cancelLastBtnRef} onClick={onCancelLastClick}>Cancel last</button>
              </div>
            </div>
          </div>
        </div>
      </main>
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
            <button className='btn' onClick={() => window.location.reload(false)}>Restart</button>
          </div>
        </div>
      </div>
      <div className='rules' ref={rulesBlockRef}>
        <div className='rules-block'>
          <div className='close-btn-block'>
            <button className='close-btn' onClick={onCloseRulesClick}></button>
          </div>
          <div className='rules-text-block'>
            <p>Guess the order of famous persons from one, who was born earlier, to one, who was born later</p>
            <p>After each guess, the color of the tiles will change to show how close your guess was to the right order.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;