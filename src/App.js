import { useEffect, useRef, useState } from 'react';
import './App.css';

const N_PERSONS = 5;
const MAX_ATTEMPTS = 6;

const boardCellDefault = {
  person: null,
  isCorrect: false
};

const boardDefault = [
  [boardCellDefault, boardCellDefault, boardCellDefault, boardCellDefault, boardCellDefault],
  [boardCellDefault, boardCellDefault, boardCellDefault, boardCellDefault, boardCellDefault],
  [boardCellDefault, boardCellDefault, boardCellDefault, boardCellDefault, boardCellDefault],
  [boardCellDefault, boardCellDefault, boardCellDefault, boardCellDefault, boardCellDefault],
  [boardCellDefault, boardCellDefault, boardCellDefault, boardCellDefault, boardCellDefault],
  [boardCellDefault, boardCellDefault, boardCellDefault, boardCellDefault, boardCellDefault],
];

const emptyCellsDefault = [0, 1, 2, 3, 4];

function useTrait(initialValue) {
  const [trait, updateTrait] = useState(initialValue);

  let current = trait;

  const get = () => current;

  const set = newValue => {
    current = newValue;
    updateTrait(newValue);
    return current;
  }

  return {
    get,
    set,
  };
}

function Person({data, onClick, title}) {
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
    <div className='card' id={data.id}>
      <img className='card-image' src={imgURL} alt={`Photo of ${data.name}`}/>
      {title ?
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

  const selectedPersons = useTrait([]);//?useState
  const board = useTrait(boardDefault);
  const personPos = useTrait(0);
  const attempt = useTrait(0);
  const isWin = useTrait(false);
  const emptyCells = useTrait(emptyCellsDefault);

  const checkBtnRef = useRef(0);
  const borderRef = useRef(0);
  const resultBlockRef = useRef(0);

  const fetchData = () => {
    fetch('https://api.pantheon.world/person')
    .then(res=>res.json())
    .then(data=>{
      return data.filter(person => person.hpi >= +80 || person.l > +100);
    })
    .then(data=>{
      const length = data.length;
      let persons = [];
      for(let i = 0; i < N_PERSONS; i++){
        const index = Math.floor(Math.random() * length);

        const person = {
          id: data[index].id,
          name: data[index].name,
          slug: data[index].slug,
          birthyear: data[index].birthyear,
          imgURL: `https://pantheon.world/images/profile/people/${data[index].id}.jpg`,
          selected: false
        };
        persons.push(person);
      }
      setPersons(persons);
      setSortedPersons(() => {
          let list = [...persons].sort((a, b) =>{
            return a.birthyear - b.birthyear;
          }); 
          return list;
        }
      );  
    });
  };
  
  const findPerson = (id) => {
    const person = persons.find(person => person.id === id);
    return person;
  };

  const checkResult = () => {
    const newPersons = [...persons];
    newPersons.map(person => person.selected = false);
    setPersons(newPersons);

    const cells = document.querySelectorAll('.card');
    let newBoard = [...board.get()];
    let correctPersons = []
    newBoard[attempt.get()].map((cell, i) => {
      if(selectedPersons.get()[i].id === sortedPersons[i].id){
        cell.isCorrect = true;
        correctPersons.push(true);
        cells[N_PERSONS*attempt.get()+i].className = 'card correct';
      } else {
        correctPersons.push(false);
        cells[N_PERSONS*attempt.get()+i].className = 'card wrong';
      };
    })
    isWin.set(correctPersons.splice(0,N_PERSONS-2).every(el=>el===true));
    if(isWin.get()){
      resultBlockRef.current.style.display = 'block';
    } else if(attempt.get() === MAX_ATTEMPTS){
      resultBlockRef.current.style.display = 'block';
    } else {
      board.set(newBoard);
      personPos.set(0);
      attempt.set(attempt.get()+1);
      selectedPersons.set([]);
      emptyCells.set(emptyCellsDefault);
    }
    checkBtnRef.current.disabled = true;
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
        emptyCells.set(emptyCells.get().filter(emptyCell=>emptyCell!==personPos.get()))
        personPos.set(personPos.get()+1);
      }
    }
    if(personPos.get() > N_PERSONS - 1) checkBtnRef.current.disabled = false;
  };

  const onCellClick = (event) => {
    const cell = event.target;
    const id = cell.parentNode.id;
    const cells = document.querySelectorAll('.card');
    const targetCell = cell.parentNode;
    const targetCellIndex = Array.from(cells).indexOf(targetCell);

    const newEmptyCells = emptyCells.get();
    newEmptyCells.push(targetCellIndex-N_PERSONS*attempt.get());
    newEmptyCells.sort();
    emptyCells.set(newEmptyCells);
    console.log(emptyCells.get());
    personPos.set(emptyCells.get()[0]);
    

    const newBoard = board.get();
    newBoard[attempt.get()][targetCellIndex-N_PERSONS*attempt.get()] = boardCellDefault;
    const newPersons = persons.map(person=>{
      if(person.id===id) person.selected=false;
      return person;
    })
    setPersons(newPersons);
    console.log();
    board.set(newBoard)
    console.log(targetCellIndex);
    selectedPersons.set(() => {
      return persons.filter(person=>person.id !== id)
    });
  }

  const onCloseClick = () => {
    resultBlockRef.current.style.display = 'none';
  }

  useEffect(()=>{
    board.set(boardDefault);
    selectedPersons.set([]);
    setSortedPersons([]);
    fetchData();
    checkBtnRef.current.disabled = true;
    resultBlockRef.current.style.display = 'none';
  },[]);

  return (    
    <div>
      <header className='header'>
        <h1 className='header-title'>
          Pantheon
        </h1>
      </header>
      <main className='main'>
        <div className="container">
          <div className='game' ref={resultBlockRef}>
            <h2>Who was born first?</h2>
            <div className='game-grid' ref={borderRef}>
              {
                <ul>
                {
                  board.get().map((row, i) => 
                    <li key={i}>
                      <ul className='game-row-list'>
                        {
                          row.map((cell, j) => {
                            if(cell.person === null) {
                              return <li className='game-row-list-item empty' key={j}>
                                <div className='card'></div>
                              </li>
                            } else {
                              return <Person data={cell.person} onClick={onCellClick} title={false} key={cell.person.id}/>
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
            <div className='game-row'>
              <ul className='game-row-list'>
                {
                  persons.map(person =>
                    <Person data={person} onClick={onPersonClick} title={true} key={person.id}/>
                  )
                }
              </ul>
            </div>
            <div>
              <button className='check-btn' ref={checkBtnRef} onClick={checkResult}>Check</button>
            </div>
          </div>
        </div>
      </main>
      <div className='result' ref={resultBlockRef}>
        <div className='result-bg'>
          <div>
            <button onClick={onCloseClick}>Close</button>
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
                      <a href={`https://pantheon.world/profile/person/${person.slug}`}>
                        {person.name}
                      </a>
                    </li>
                  })
              }
            </ul>
          </div>
          <div>
            <button onClick={() => window.location.reload(false)}>Restart</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
