'use strict';

/* Nav bar*/
(function() {
  const path = window.location.pathname;
  const endpoint = (path.match(/^\/\w+/g));
  const navbar = document.getElementById('navbar');
  if (navbar.children.length === 3) {
    if (endpoint[0] === '/schedule') {
      navbar.children[1].className += " active";
    } else if (endpoint[0] === '/profile') {
      navbar.children[2].className += " active";
    } else {
    navbar.children[0].className += " active";
    }
  } else {
    if (endpoint[0] === '/search') {
      navbar.children[1].className += " active";
    } else if (endpoint[0] === '/book') {
      navbar.children[2].className += " active";
    } else if (endpoint[0] === '/contacts') {
      navbar.children[3].className += " active";
    } else if (endpoint[0] === '/profile') {
      navbar.children[4].className += " active";
    } else {
      navbar.children[0].className += " active";
    }
  }
})();



/*Shared functions*/
function removeChildren(e) {
  if (e) {
    while(e.firstChild) {
    e.removeChild(e.firstChild);
    }
  }
}








