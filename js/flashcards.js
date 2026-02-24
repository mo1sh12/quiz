document.addEventListener('DOMContentLoaded', async function() {
    // --- 1. DOM Element Setup ---
    const deckTitleEl = document.getElementById('deck-title');
    const cardFrontContentEl = document.getElementById('card-front-content');
    const cardBackContentEl = document.getElementById('card-back-content');
    const flashcardEl = document.getElementById('flashcard');
    const counterEl = document.getElementById('flashcard-counter');
    const progressBarEl = document.getElementById('flashcard-progress-bar');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const flipBtn = document.getElementById('flip-btn');
    const siteTitleEl = document.getElementById('site-title');

    // --- 2. State Variables ---
    let mainDeck = [];
    let currentCardIndex = 0;
    let localStorageKey = '';

    // --- 3. Initialization ---
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const path = urlParams.get('path'); // e.g., /cairo/Medicin/1/1/Anatomy
        const deckId = urlParams.get('collection'); // optional
        const selectedUniId = localStorage.getItem('selectedUni');

        if (!selectedUniId || !path) throw new Error('Missing parameters.');

        // --- Build localStorage key ---
        localStorageKey = `flashcard-progress-${selectedUniId}-${path}-${deckId || 'default'}`;

        // --- Build JSON path dynamically ---
        const jsonPath = `./json${path}/flashcard.json`;
        const response = await fetch(jsonPath);
        if (!response.ok) throw new Error(`Flashcard JSON file not found at ${jsonPath}`);

        const data = await response.json();

        siteTitleEl.textContent = `${data.university || selectedUniId} Quiz platform`;

        // --- Load the deck ---
        if (!data.resources || !data.resources.flashcards || data.resources.flashcards.length === 0) {
            throw new Error('No flashcards found in JSON.');
        }

        let flashcardDeck;
        if (deckId) {
            flashcardDeck = data.resources.flashcards.find(d => d.id === deckId);
            if (!flashcardDeck) throw new Error(`Deck with id "${deckId}" not found.`);
        } else {
            flashcardDeck = data.resources.flashcards[0]; // default first deck
        }

        mainDeck = flashcardDeck.cards || [];
        deckTitleEl.textContent = flashcardDeck.title || 'Flashcards';

        // --- Load saved progress ---
        loadProgress();
        displayCard(currentCardIndex);

    } catch (error) {
        deckTitleEl.textContent = `Error: ${error.message}`;
        console.error(error);
        return;
    }

    // --- 4. Core Functions ---
    function displayCard(index) {
        if (!mainDeck || mainDeck.length === 0) return;
        if (index >= mainDeck.length) index = mainDeck.length - 1;
        currentCardIndex = index;
        const card = mainDeck[currentCardIndex];

        flashcardEl.classList.remove('is-flipped');
        cardFrontContentEl.textContent = card.front;
        cardBackContentEl.textContent = card.back;

        updateProgress(currentCardIndex, mainDeck.length);
        saveProgress();
    }

    function updateProgress(index, total) {
        if (!mainDeck || mainDeck.length === 0) return;

        // --- Counter & Progress Bar ---
        counterEl.textContent = `${index + 1} / ${total}`;
        progressBarEl.style.width = `${((index + 1) / total) * 100}%`;

        // --- Button States ---
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === total - 1;

        // --- Enhanced Visuals ---
        progressBarEl.style.background = 'linear-gradient(90deg, #4a90e2, #50e3c2)'; // gradient modern
        counterEl.style.color = '#2c3e50'; // dark slate
        deckTitleEl.style.color = '#1c1c1c'; // stronger dark title

        // --- Glow effect on progress ---
        progressBarEl.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
    }

    function saveProgress() {
        localStorage.setItem(localStorageKey, currentCardIndex);
    }

    function loadProgress() {
        const savedIndex = localStorage.getItem(localStorageKey);
        if (savedIndex && parseInt(savedIndex, 10) < mainDeck.length) {
            currentCardIndex = parseInt(savedIndex, 10);
        } else {
            currentCardIndex = 0;
        }
    }

    // --- 5. Event Listeners ---
    flashcardEl.addEventListener('click', () => {
        flashcardEl.classList.toggle('is-flipped');
        flashcardEl.style.boxShadow = flashcardEl.classList.contains('is-flipped') 
            ? '0 25px 50px rgba(0,0,0,0.35)' 
            : '0 12px 24px rgba(0,0,0,0.25)';

        flashcardEl.style.transition = 'transform 0.6s, box-shadow 0.35s, background 0.3s';
    });

    flipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        flashcardEl.classList.toggle('is-flipped');
        flashcardEl.style.boxShadow = flashcardEl.classList.contains('is-flipped') 
            ? '0 25px 50px rgba(0,0,0,0.35)' 
            : '0 12px 24px rgba(0,0,0,0.25)';
    });

    prevBtn.addEventListener('click', () => {
        if (currentCardIndex > 0) displayCard(currentCardIndex - 1);
    });

    nextBtn.addEventListener('click', () => {
        if (currentCardIndex < mainDeck.length - 1) displayCard(currentCardIndex + 1);
    });

    // --- 6. Smooth Transitions & Visual Enhancements ---
    flashcardEl.style.transition = 'transform 0.6s ease-in-out, box-shadow 0.35s, background 0.3s';
    progressBarEl.style.transition = 'width 0.35s ease-in-out, background 0.35s';
    counterEl.style.transition = 'color 0.3s ease-in-out, font-weight 0.3s';
    deckTitleEl.style.transition = 'color 0.3s ease-in-out, text-shadow 0.3s';

    // --- 7. Optional: Hover Effects for Buttons ---
    [prevBtn, nextBtn, flipBtn].forEach(btn => {
        btn.style.transition = 'all 0.25s ease';
        btn.addEventListener('mouseenter', () => btn.style.transform = 'scale(1.05)');
        btn.addEventListener('mouseleave', () => btn.style.transform = 'scale(1)');
    });
});