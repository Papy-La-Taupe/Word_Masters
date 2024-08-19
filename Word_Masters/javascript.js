async function getWordOfTheDay() {
    const url = 'https://words.dev-apis.com/word-of-the-day?random=1';
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const word = data.word;  
        return word.toUpperCase();  
    } catch (error) {
        console.error('Error fetching the word of the day:', error);
    }
}

async function validateWord(guessedWord) {
    if (guessedWord.length !== 5) {
        throw new Error('Word must be 5 letters long');
    }

    guessedWord = guessedWord.toUpperCase();
    const url = 'https://words.dev-apis.com/validate-word';
    const body = JSON.stringify({ word: guessedWord });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body,
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (!data.validWord) {
            return 'invalid';
        }
    } catch (error) {
        console.error('Error validating guess:', error);
        throw error;
    }

    return 'valid';
}

function checkWord(wordToTest, guessedWord) {
    const guessedWordStr = guessedWord.join('').toLowerCase();
    if (guessedWordStr === wordToTest.toLowerCase()) {
        return "win";
    } else {
        return "missed";
    }
}

async function applyColoringToGuessedWord(wordToTest, guessedWord, currentLine) {
    const solutionArray = wordToTest.toUpperCase().split('');
    const guessedArray = guessedWord.slice(); 
    const isLetterMatched = new Array(5).fill(false);

    const isValid = await validateWord(guessedWord.join(''));

    if (isValid === 'invalid') {
        for (let i = 0; i < guessedArray.length; i++) {
            const currentBox = document.querySelector(`.${currentLine}${i + 1}`);
            currentBox.style.backgroundColor = 'gray';
        }
        return;
    }

    for (let i = 0; i < guessedArray.length; i++) {
        const currentBox = document.querySelector(`.${currentLine}${i + 1}`);

        if (guessedArray[i] === solutionArray[i]) {
            currentBox.style.backgroundColor = 'green';
            isLetterMatched[i] = true;
            guessedArray[i] = null;
            solutionArray[i] = null;
        }
    }

    for (let i = 0; i < guessedArray.length; i++) {
        if (guessedArray[i] !== null) {
            const currentBox = document.querySelector(`.${currentLine}${i + 1}`);
            const partialMatchIndex = solutionArray.indexOf(guessedArray[i]);

            if (partialMatchIndex !== -1) {
                currentBox.style.backgroundColor = 'orange';
                solutionArray[partialMatchIndex] = null;
            } else {
                currentBox.style.backgroundColor = 'red';
            }
        }
    }
}

(async function handleKeyPress() {
    let wordToTest = await getWordOfTheDay();
    console.log(wordToTest);
    let currentLine = 'A';
    let currentIndex = 1;
    let guessedWord = [];

    function processKey(event) {
        const key = event.key.toUpperCase();
        if (key.length === 1 && key >= 'A' && key <= 'Z') { 
            const targetDiv = document.querySelector(`.${currentLine}${currentIndex}`);
            if (targetDiv) {
                targetDiv.textContent = key; 
                guessedWord.push(key);
                currentIndex++;
            }

            if (currentIndex > 5) { 
                checkWord(wordToTest, guessedWord);
                applyColoringToGuessedWord(wordToTest, guessedWord, currentLine).then(() => {
                    if (guessedWord.join('') === wordToTest) {
                        document.removeEventListener('keydown', processKey); 
                        if (confirm("Bravo !, recommencer ?")) {
                            resetGame();
                        }
                    } else if (currentLine === 'F') {
                        document.removeEventListener('keydown', processKey); 
                        if (confirm("Perdu, recommencer ?")) {
                            resetGame();
                        }
                    } else {
                        currentLine = String.fromCharCode(currentLine.charCodeAt(0) + 1);
                        currentIndex = 1;
                        guessedWord = [];
                    }
                });
            }
        }
    }

    function resetGame() {
        currentLine = 'A';
        currentIndex = 1;
        guessedWord = [];
        
        ['A', 'B', 'C', 'D', 'E', 'F'].forEach(letter => {
            for (let i = 1; i <= 5; i++) {
                const targetDiv = document.querySelector(`.${letter}${i}`);
                if (targetDiv) {
                    targetDiv.textContent = '';
                    targetDiv.style.backgroundColor = ''; 
                }
            }
        });
        document.addEventListener('keydown', processKey); 
    }

    document.addEventListener('keydown', processKey); 
})();
