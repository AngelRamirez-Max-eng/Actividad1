// --- ESTADO DEL JUEGO ---
let columns = [[], [], [], []]; // Representa las 4 columnas de cartas
const MAX_CARDS = 8;            // Límite de cartas por columna
let score = 0;                  // Puntaje acumulado
let currentCard = null;         // Carta que el jugador debe colocar
let gameOver = false;           // Estado del juego

// --- ELEMENTOS DEL DOM ---
const columnsElems = [
    document.getElementById('col-0'),
    document.getElementById('col-1'),
    document.getElementById('col-2'),
    document.getElementById('col-3')
];
const nextCardContainer = document.getElementById('next-card-container');
const scoreElem = document.getElementById('score');
const restartBtn = document.getElementById('restart-btn');
const modalRestartBtn = document.getElementById('modal-restart-btn');
const gameOverScreen = document.getElementById('game-over');
const finalScoreValue = document.getElementById('final-score-value');

// --- EVENTOS INICIALES ---
window.addEventListener('load', initGame);
restartBtn.addEventListener('click', initGame);
modalRestartBtn.addEventListener('click', initGame);

// Registrar clics en las columnas
columnsElems.forEach((colElem, index) => {
    colElem.addEventListener('click', () => {
        if (!gameOver) {
            handleColumnClick(index);
        }
    });
});

// --- FUNCIONES DEL JUEGO ---

// Inicializar / Reiniciar juego
function initGame() {
    columns = [[], [], [], []];
    score = 0;
    gameOver = false;
    scoreElem.textContent = score;
    gameOverScreen.style.display = 'none';
    generateNextCard();
    renderBoard();
}

// Genera valores de cartas: 2 (40%), 4 (30%), 8 (15%), 16 (10%), 32 (5%)
function generateNextCard() {
    const r = Math.random();
    if (r < 0.40) currentCard = 2;
    else if (r < 0.70) currentCard = 4;
    else if (r < 0.85) currentCard = 8;
    else if (r < 0.95) currentCard = 16;
    else currentCard = 32;

    renderNextCard();
}

// Renderiza visualmente la carta del mazo
function renderNextCard() {
    nextCardContainer.innerHTML = '';
    if (currentCard) {
        const cardElem = createCardElement(currentCard);
        nextCardContainer.appendChild(cardElem);
    }
}

// Crea la estructura HTML y clases CSS para una carta
function createCardElement(value) {
    const card = document.createElement('div');
    card.classList.add('card', `card-${value}`);
    card.textContent = value;
    return card;
}

// Maneja la acción cuando el usuario selecciona una columna
function handleColumnClick(colIndex) {
    const col = columns[colIndex];

    // Condición de derrota si la columna excede el límite y no se puede fusionar
    if (col.length >= MAX_CARDS) {
        const topCardValue = col[col.length - 1];
        if (currentCard !== topCardValue) {
            // El usuario fuerza la colocación de una novena carta sin fusión
            col.push(currentCard);
            renderBoard();
            triggerGameOver();
            return;
        }
    }

    // Colocar carta en la columna
    col.push(currentCard);

    // Activar lógica de fusión recursiva
    const hit2048 = processMerges(colIndex);

    if (hit2048) {
        // Efecto especial: Limpiar columna completa al llegar a 2048
        triggerClearEffect(colIndex);
    }

    // Comprobar si tras la resolución la columna sobrepasa el límite establecido
    if (columns[colIndex].length > MAX_CARDS) {
        triggerGameOver();
        return;
    }

    // Actualizar interfaz y proceder a la siguiente jugada
    scoreElem.textContent = score;
    renderBoard();
    generateNextCard();
}

/**
 * Lógica de Fusión Recursiva (Efectos en cadena)
 * @param {number} colIndex - Índice de la columna a evaluar
 * @returns {boolean} - Indica si se alcanzó el valor 2048 en alguna fusión
 */
function processMerges(colIndex) {
    let col = columns[colIndex];
    if (col.length < 2) return false;

    let topIndex = col.length - 1;
    // Si la carta recién llegada (top) coincide con la que está justo debajo (N-2)
    if (col[topIndex] === col[topIndex - 1]) {
        let mergedValue = col[topIndex] * 2;
        col[topIndex - 1] = mergedValue; // La carta de abajo se actualiza con la suma
        col.pop();                       // Removemos la carta superior duplicada
        score += mergedValue;            // Acumular puntaje

        // Verificar si se alcanzó el valor especial 2048
        if (mergedValue === 2048) {
            columns[colIndex] = []; // Limpia la columna de inmediato
            return true;
        }

        // Llamada recursiva para evaluar si el nuevo valor combina con el anterior
        const deeperMergeResult = processMerges(colIndex);
        return deeperMergeResult || (mergedValue === 2048);
    }
    return false;
}

// Limpieza visual con efecto flash en la columna
function triggerClearEffect(colIndex) {
    const colElem = columnsElems[colIndex];
    colElem.classList.add('clearing');
    setTimeout(() => {
        colElem.classList.remove('clearing');
    }, 600);
}

// Dibuja el estado actual de las 4 columnas en el DOM
function renderBoard() {
    columns.forEach((col, index) => {
        const colElem = columnsElems[index];
        colElem.innerHTML = ''; // Limpiar elementos previos

        col.forEach(val => {
            const cardElem = createCardElement(val);
            colElem.appendChild(cardElem);
        });
    });
}

// Terminar la partida
function triggerGameOver() {
    gameOver = true;
    finalScoreValue.textContent = score;
    gameOverScreen.style.display = 'flex';
}