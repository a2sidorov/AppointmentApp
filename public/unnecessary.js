let h, m;
let hour = 300;
let x = 0;
let y = 0;
let rad;
let d = 100;
let num;
let numTxt;
let k = 0.075;
for (h = 1; h <= 12; h++) {
  for (m = 0; m < 60; m += 30) {
    let num = document.createElement("LI");
    if (m === 0) {
      numTxt = document.createTextNode(h);
    } else {
      numTxt = document.createTextNode(m);
    }
    num.appendChild(numTxt);
    num.style.position = "absolute";
    rad = hour * (Math.PI / 180);
    x = Math.cos(rad) * d;
    y = Math.sin(rad) * d;
    if (x >= 0) { 
      num.style.left = x - 13 + "px";
    } else {
      num.style.right = -1 * x - 13 + "px";
    }
    if (y >= 0 ) {
      num.style.top = y + "px";
    } else {
      num.style.bottom = -1 * y - 26 + "px";
    }
    console.log(`${h} x: ${x} y: ${y}`)
    document.getElementById("clock").appendChild(num);
    hour += 15;
  }
}