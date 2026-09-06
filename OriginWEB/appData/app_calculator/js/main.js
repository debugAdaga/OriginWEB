let display_calc = document.getElementById("display_calc");

function append_calc(value) {
  const current = display_calc.innerText;

  if (current === "Error") return;
  else if (current === "Infinity") return;
  else if (current === "NaN") return;

  if (value === "+/-") {
    if (current.startsWith("-")) {
      display_calc.innerText = current.slice(1);
    } else if (current !== "0") {
      display_calc.innerText = "-" + current;
    }
  } else if (value === ".") {
    if (current === "0") {
      display_calc.innerText = "0.";
    } else {
      display_calc.innerText += ".";
    }
  } else if (value === "%") {
    try {
      const num = parseFloat(current);
      if (!isNaN(num)) {
        display_calc.innerText = (num / 100).toString();
      }
    } catch {
      display_calc.innerText = "Error";
    }
  } else {
    if (current === "0" && value !== ".") {
      display_calc.innerText = value;
    } else {
      display_calc.innerText += value;
    }
  }
}

function clearDisplay_calc() {
  display_calc.innerText = "0";
}

function backspace_calc() {
  if (display_calc.innerText === "Error") return;

  let text = display_calc.innerText;
  if (text.length > 1) {
    display_calc.innerText = text.slice(0, -1);
  } else {
    display_calc.innerText = "0";
  }
}

function calculate_calc() {
  if (display_calc.innerText === "Error") return;
  else if (display_calc.innerText === "Infinity") return;
  else if (display_calc.innerText === "NaN") return;

  try {
    let expression = display_calc.innerText
      .replace(/÷/g, "/")
      .replace(/×/g, "*")
      .replace(/−/g, "-");

    const result = eval(expression);
    
    if (!isFinite(result)) {
      display_calc.innerText = "Error";
      return;
    }
    
    if (Number.isInteger(result)) {
      display_calc.innerText = result.toString();
    } else {
      display_calc.innerText = parseFloat(result.toFixed(10)).toString();
    }
  } catch {
    display_calc.innerText = "Error";
  }
}

document.addEventListener('keydown', function(e) {
  const key = e.key;
  
  if (key >= '0' && key <= '9') {
    append_calc(key);
  } else if (key === '.') {
    append_calc('.');
  } else if (key === '+') {
    append_calc('+');
  } else if (key === '-') {
    append_calc('-');
  } else if (key === '*') {
    append_calc('*');
  } else if (key === '/') {
    append_calc('/');
  } else if (key === 'Enter' || key === '=') {
    e.preventDefault();
    calculate_calc();
  } else if (key === 'Backspace') {
    backspace_calc();
  } else if (key === 'Escape') {
    const container = document.querySelector('.calculator_calc');
    if (container) container.style.display = 'none';
  } else if (key === 'c' || key === 'C') {
    clearDisplay_calc();
  }
});
