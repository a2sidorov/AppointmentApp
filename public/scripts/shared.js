'use strict';

function removeChildren(e) {
  while(e.childNodes[0]) {
    e.removeChild(e.childNodes[0]); 
  }
}

function displayError(message) {
  const txt = document.createTextNode(message);
  const div = document.createElement('div');
  div.style.color = 'red';
  div.appendChild(txt);
  removeChildren(main);
  main.appendChild(div);
}

