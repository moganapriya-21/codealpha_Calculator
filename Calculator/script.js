/* ============================================================
   CALCULATOR — script.js
   Clean, commented, beginner-friendly vanilla JS
   ============================================================ */

// ── DOM references ───────────────────────────────────────────
const displayEl = document.getElementById('display');
const historyEl = document.getElementById('history');

// ── Calculator State ─────────────────────────────────────────
let currentValue   = '0';   // The number currently on screen
let previousValue  = '';    // The number entered before an operator
let currentOp      = null;  // The pending operator (+, -, *, /)
let shouldReset    = false; // True after = or operator: next digit starts fresh
let justCalculated = false; // True right after pressing =

// ── Helper: update the display ───────────────────────────────
function updateDisplay(value) {
  displayEl.classList.remove('error', 'result-flash', 'shrink-1', 'shrink-2');

  const str = String(value);
  displayEl.textContent = str;

  // Shrink font if number is long
  if (str.length > 12) displayEl.classList.add('shrink-2');
  else if (str.length > 9) displayEl.classList.add('shrink-1');
}

// ── Helper: flash teal on result ─────────────────────────────
function flashResult() {
  displayEl.classList.add('result-flash');
  setTimeout(() => displayEl.classList.remove('result-flash'), 400);
}

// ── Helper: show error ────────────────────────────────────────
function showError(msg = 'Error') {
  displayEl.textContent = msg;
  displayEl.classList.add('error');
  historyEl.textContent = '';
  resetState();
}

// ── Helper: reset all state to zero ──────────────────────────
function resetState() {
  currentValue   = '0';
  previousValue  = '';
  currentOp      = null;
  shouldReset    = false;
  justCalculated = false;
}

// ── Helper: format number (remove trailing zeros) ────────────
function formatNumber(num) {
  // Limit decimal places to avoid floating-point noise
  const n = parseFloat(num.toPrecision(12));
  return String(n);
}

// ── Highlight the active operator button ─────────────────────
function highlightOp(action) {
  document.querySelectorAll('.btn--op').forEach(b => b.classList.remove('active'));
  if (action) {
    const btn = document.querySelector(`.btn--op[data-action="${action}"]`);
    if (btn) btn.classList.add('active');
  }
}

// ── Core: perform the actual arithmetic ──────────────────────
function calculate(a, op, b) {
  const numA = parseFloat(a);
  const numB = parseFloat(b);

  switch (op) {
    case 'add':      return numA + numB;
    case 'subtract': return numA - numB;
    case 'multiply': return numA * numB;
    case 'divide':
      if (numB === 0) { showError('÷ 0'); return null; }
      return numA / numB;
    default:         return numB;
  }
}

// ── Map operator action → symbol for history display ─────────
const OP_SYMBOLS = { add: '+', subtract: '−', multiply: '×', divide: '÷' };

// ── Action Handlers ──────────────────────────────────────────

/* Handle digit / decimal input */
function handleNumber(value) {
  // Limit input to 15 characters
  if (currentValue.length >= 15 && !shouldReset) return;

  if (shouldReset) {
    currentValue = value === '.' ? '0.' : value;
    shouldReset  = false;
  } else {
    if (currentValue === '0' && value !== '.') {
      currentValue = value;                     // Replace leading zero
    } else if (value === '.' && currentValue.includes('.')) {
      return;                                   // Only one decimal allowed
    } else {
      currentValue += value;
    }
  }

  justCalculated = false;
  updateDisplay(currentValue);
}

/* Handle operator (+, −, ×, ÷) */
function handleOperator(action) {
  highlightOp(action);

  // If we already have a pending operation, evaluate it first (chaining)
  if (currentOp && !shouldReset) {
    const result = calculate(previousValue, currentOp, currentValue);
    if (result === null) return;               // Error was shown
    const formatted = formatNumber(result);
    historyEl.textContent = `${previousValue} ${OP_SYMBOLS[currentOp]} ${currentValue} ${OP_SYMBOLS[action]}`;
    previousValue = formatted;
    updateDisplay(formatted);
    currentValue = formatted;
  } else {
    previousValue = currentValue;
    historyEl.textContent = `${currentValue} ${OP_SYMBOLS[action]}`;
  }

  currentOp      = action;
  shouldReset    = true;
  justCalculated = false;
}

/* Handle equals */
function handleEquals() {
  if (!currentOp || previousValue === '') return;

  const a      = previousValue;
  const b      = currentValue;
  const result = calculate(a, currentOp, b);
  if (result === null) return;

  const formatted = formatNumber(result);

  // Show full expression in history
  historyEl.textContent = `${a} ${OP_SYMBOLS[currentOp]} ${b} =`;

  currentValue   = formatted;
  previousValue  = '';
  currentOp      = null;
  shouldReset    = true;
  justCalculated = true;

  highlightOp(null);
  updateDisplay(formatted);
  flashResult();
}

/* Clear everything */
function handleClear() {
  resetState();
  historyEl.textContent = '';
  updateDisplay('0');
  highlightOp(null);
}

/* Delete last digit */
function handleDelete() {
  if (shouldReset || justCalculated) {
    // Delete after result clears the whole number
    currentValue = '0';
    shouldReset  = false;
    justCalculated = false;
  } else {
    currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : '0';
  }
  updateDisplay(currentValue);
}

/* Toggle positive / negative */
function handleSign() {
  if (currentValue === '0') return;
  currentValue = currentValue.startsWith('-')
    ? currentValue.slice(1)
    : '-' + currentValue;
  updateDisplay(currentValue);
}

/* Percentage — divide current value by 100 */
function handlePercent() {
  const num = parseFloat(currentValue) / 100;
  currentValue = formatNumber(num);
  updateDisplay(currentValue);
}

// ── Main dispatcher ──────────────────────────────────────────
function dispatch(action, value) {
  switch (action) {
    case 'num':      handleNumber(value);    break;
    case 'decimal':  handleNumber('.');      break;
    case 'add':
    case 'subtract':
    case 'multiply':
    case 'divide':   handleOperator(action); break;
    case 'equals':   handleEquals();         break;
    case 'clear':    handleClear();          break;
    case 'delete':   handleDelete();         break;
    case 'sign':     handleSign();           break;
    case 'percent':  handlePercent();        break;
  }
}

// ── Button click listener ────────────────────────────────────
document.querySelector('.btn-grid').addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;

  // Small press animation
  btn.style.transform = 'scale(0.94)';
  setTimeout(() => { btn.style.transform = ''; }, 110);

  dispatch(btn.dataset.action, btn.dataset.value);
});

// ── Keyboard support ─────────────────────────────────────────
document.addEventListener('keydown', (e) => {

  if (/^[0-9]$/.test(e.key)) {
    e.preventDefault();
    dispatch('num', e.key);
    highlightKey(e.key);
    return;
  }

  switch (e.key) {
    case '.':
    case ',':
      e.preventDefault(); dispatch('decimal');  break;
    case 'Enter':
    case '=':
      e.preventDefault(); dispatch('equals');   break;
    case 'Backspace':
      e.preventDefault(); dispatch('delete');   break;
    case 'Escape':
    case 'Delete':
      e.preventDefault(); dispatch('clear');    break;
    case '+':
      e.preventDefault(); dispatch('add');      break;
    case '-':
      e.preventDefault(); dispatch('subtract'); break;
    case '*':
      e.preventDefault(); dispatch('multiply'); break;
    case '/':
      e.preventDefault(); dispatch('divide');   break;
    case '%':
      e.preventDefault(); dispatch('percent');  break;
  }
});

/* Visually "press" the matching button on keyboard input */
function highlightKey(key) {
  const btn = document.querySelector(`.btn[data-value="${key}"]`);
  if (!btn) return;
  btn.style.transform = 'scale(0.94)';
  setTimeout(() => { btn.style.transform = ''; }, 110);
}

// ── Initial display render ───────────────────────────────────
// Existing calculator code above...


updateDisplay('0');
