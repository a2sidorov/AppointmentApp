'use strict';

/* Nav bar*/
document.querySelectorAll("[class*='demo-icon']").forEach(a => {
  if (a.getAttribute('href') === window.location.pathname) {
    a.classList.add('active');
  } else {
    a.classList.remove('active');
  }
});

/* Shared functions */
function removeChildren(e) {
  while(e.childNodes[0]) {
    e.removeChild(e.childNodes[0]); 
  }
}

function displayError(message) {
  const txt = document.createTextNode(message);
  const div = document.createElement('div');
  div.style.color = '#ff0000';
  div.appendChild(txt);
  removeChildren(main);
  main.appendChild(div);
}

