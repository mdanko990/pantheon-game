import Person from "../Person/Person";

export default function Game ({MAX_ATTEMPTS,
                              N_PERSONS,
                              fetchError,
                              persons,
                              setPersons,
                              selectedPersons,
                              sortedPersons,
                              board,
                              boardCellDefault,
                              personPos,
                              attempt,
                              isWin,
                              resultToShare,
                              checkBtnRef,
                              cancelLastBtnRef,
                              resultBlockRef
                            }) {

  const onPersonClick = (event) => {
    const id = event.target.parentNode.id;
    const person = persons.find(person => person.id === id);
    
    if (personPos.get() < N_PERSONS) {
      if (person.selected === false) {
        selectPerson(person);
        personPos.set(personPos.get()+1);
      }
    }
    
    if (personPos.get() > N_PERSONS - 1) checkBtnRef.current.disabled = false;
    
    cancelLastBtnRef.current.disabled = false;
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
        resultToShare.set(resultToShare.get()+'🟩');
      } else {
        correctPersons.push(false);
        cells[N_PERSONS*attempt.get()+i].className = 'card wrong';
        resultToShare.set(resultToShare.get()+'🟥');
      }
    });

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
      resultToShare.set(resultToShare.get()+'\n');
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
  };

  return (
    <main className='main'>
      <div className='game'>
        <div className='game-header'>
          <h2 className='game-name'>Who was born first?</h2>
        </div>
        <div className='game-main'>
          <div className='game-board'>
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
  );
}