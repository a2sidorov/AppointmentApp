'use strict';

function removeChildren(e) {
  while(e.childNodes[0]) {
    e.removeChild(e.childNodes[0]); 
  }
}

