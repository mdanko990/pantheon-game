import { useEffect, useRef, useState } from 'react';
import './App.css';
import fetchSlugs from './server/fetchSlugs';
import Header from './components/Header/Header';
import Result from './components/Result/Result';
import Rules from './components/Rules/Rules';
import Game from './components/Game/Game';
import useTrait from './useTrait';

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

function App() {
  const [persons, setPersons] = useState([]);
  const [sortedPersons, setSortedPersons] = useState([]);

  const fetchError = useTrait(false);
  const selectedPersons = useTrait([]);
  const board = useTrait(boardDefault);
  const personPos = useTrait(0);
  const attempt = useTrait(0);
  const isWin = useTrait(false);
  const resultToShare = useTrait('');

  const resultBlockRef = useRef(0);
  const rulesBlockRef = useRef(0);
  const cancelLastBtnRef = useRef(0);
  const checkBtnRef = useRef(0);

  const generatePerson = (data, slug) => {
    const obj = data.find(person => person.slug === slug);

    return {
      id: obj.id,
      name: obj.name,
      slug: obj.slug,
      birthdate: obj.birthdate,
      birthyear: obj.birthyear,
      imgURL: `https://pantheon.world/images/profile/people/${obj.id}.jpg`,
      selected: false
    };
  };

  const fetchData = async () => {
    const slugs = await fetchSlugs();

    return await fetch('https://api.pantheon.world/person?hpi=gt.80')
    .then(res => res.json())
    .then(data => {
      let persons = slugs.map(el => {
        const slug = el.replace("'", '').replace("'", '');
        return generatePerson(data, slug); 
      });

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
    })
  };


  useEffect(() => {
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
      <Rules rulesBlockRef={rulesBlockRef}/>
      <Header rulesBlockRef={rulesBlockRef}/>
      <Game MAX_ATTEMPTS={MAX_ATTEMPTS}
            N_PERSONS={N_PERSONS}
            fetchError={fetchError}
            persons={persons}
            setPersons={setPersons}
            selectedPersons={selectedPersons}
            sortedPersons={sortedPersons}
            board={board}
            boardCellDefault={boardCellDefault}
            personPos={personPos}
            attempt={attempt}
            isWin={isWin}
            resultToShare={resultToShare}
            checkBtnRef={checkBtnRef}
            cancelLastBtnRef={cancelLastBtnRef}
            resultBlockRef={resultBlockRef}/>
      <Result sortedPersons={sortedPersons}
              attempt={attempt}
              isWin={isWin}
              resultToShare={resultToShare}
              resultBlockRef={resultBlockRef}/>
    </div>
  );
}

export default App;