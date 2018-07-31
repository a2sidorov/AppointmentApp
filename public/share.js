'use strict';
/*Client booking*/
const getAmTime = function(time) {
  let hourInt = parseInt(time.substring(0, 2), 10);
  let minStr = time.substring(3);
  if (hourInt < 12 || (hourInt === 12 && minStr === '00')) {
    return `${hourInt}:${minStr}`;
  } 
}
const getPmTime = function(time) {
  let hourInt = parseInt(time.substring(0, 2), 10);
  let minStr = time.substring(3);
  if (hourInt === 12 && minStr === '30') {
    return `${hourInt}:${minStr}`;
  } else if (hourInt > 12) {
    hourInt -= 12;
    return `${hourInt}:${minStr}`;
  }
}


module.exports = {
    getAmTime: getAmTime,
    getPmTime: getPmTime,
}


