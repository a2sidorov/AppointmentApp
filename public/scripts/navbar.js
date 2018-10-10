'use strict';

/* Nav bar*/
document.querySelectorAll('[href]').forEach(icon => {
  const location = (window.path.match(/^\/\w+/g));
});
 // if (icon.getAttribute('href') === endpoint) {

 // }




/*
  document.querySelectorAll('[href]').forEach(icon => {
    button.onclick = function() {
        document.querySelectorAll("[class*='category']").forEach(div => {
            if (this.getAttribute('data-filter') === 'all')
                div.style.display = "block";
            else
                if (div.classList.contains(this.getAttribute('data-filter')))
                    div.style.display = "block";
                else
                    div.style.display = "none";
        });  
    }
});
*/
/*
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
*/



/*Shared functions*/
function removeChildren(e) {
  if (e) {
    while(e.firstChild) {
    e.removeChild(e.firstChild);
    }
  }
}








