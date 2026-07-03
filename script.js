
const displayEl = document.getElementById('display');
const historyEl = document.getElementById('history');


let currentValue   = '0';   
let previousValue  = '';   
let currentOp      = null;  
let shouldReset    = false; 
let justCalculated = false; 


function updateDisplay(value) {
  displayEl.classList.remove('error', 'result-flash', 'shrink-1', 'shrink-2');

  const str = String(value);
  displayEl.textContent = str;

 
  if (str.length > 12) displayEl.classList.add('shrink-2');
  else if (str.length > 9) displayEl.classList.add('shrink-1');
}


function flashResult() {
  displayEl.classList.add('result-flash');
  setTimeout(() => displayEl.classList.remove('result-flash'), 400);
}


function showError(msg = 'Error') {
  displayEl.textContent = msg;
  displayEl.classList.add('error');
  historyEl.textContent = '';
  resetState();
}


function resetState() {
  currentValue   = '0';
  previousValue  = '';
  currentOp      = null;
  shouldReset    = false;
  justCalculated = false;
}


function formatNumber(num) {
  const n = parseFloat(num.toPrecision(12));
  return String(n);
}

function highlightOp(action) {
  document.querySelectorAll('.btn--op').forEach(b => b.classList.remove('active'));
  if (action) {
    const btn = document.querySelector(`.btn--op[data-action="${action}"]`);
    if (btn) btn.classList.add('active');
  }
}

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

const OP_SYMBOLS = { add: '+', subtract: '−', multiply: '×', divide: '÷' };

function handleNumber(value) {
  if (currentValue.length >= 15 && !shouldReset) return;

  if (shouldReset) {
    currentValue = value === '.' ? '0.' : value;
    shouldReset  = false;
  } else {
    if (currentValue === '0' && value !== '.') {
      currentValue = value;                    
    } else if (value === '.' && currentValue.includes('.')) {
      return;                                  
    } else {
      currentValue += value;
    }
  }

  justCalculated = false;
  updateDisplay(currentValue);
}

function handleOperator(action) {
  highlightOp(action);
  if (currentOp && !shouldReset) {
    const result = calculate(previousValue, currentOp, currentValue);
    if (result === null) return;              
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

function handleEquals() {
  if (!currentOp || previousValue === '') return;

  const a      = previousValue;
  const b      = currentValue;
  const result = calculate(a, currentOp, b);
  if (result === null) return;

  const formatted = formatNumber(result);
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
function handleClear() {
  resetState();
  historyEl.textContent = '';
  updateDisplay('0');
  highlightOp(null);
}

function handleDelete() {
  if (shouldReset || justCalculated) {

    currentValue = '0';
    shouldReset  = false;
    justCalculated = false;
  } else {
    currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : '0';
  }
  updateDisplay(currentValue);
}

function handleSign() {
  if (currentValue === '0') return;
  currentValue = currentValue.startsWith('-')
    ? currentValue.slice(1)
    : '-' + currentValue;
  updateDisplay(currentValue);
}

function handlePercent() {
  const num = parseFloat(currentValue) / 100;
  currentValue = formatNumber(num);
  updateDisplay(currentValue);
}

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

document.querySelector('.btn-grid').addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  btn.style.transform = 'scale(0.94)';
  setTimeout(() => { btn.style.transform = ''; }, 110);

  dispatch(btn.dataset.action, btn.dataset.value);
});

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

function highlightKey(key) {
  const btn = document.querySelector(`.btn[data-value="${key}"]`);
  if (!btn) return;
  btn.style.transform = 'scale(0.94)';
  setTimeout(() => { btn.style.transform = ''; }, 110);
}

updateDisplay('0');
