/*List of doctors*/
function dropdown() {
  document.getElementById("dropdown-contentId").classList.toggle('show');
}

/*Side nav*/
function openNav() {
  console.log('works');
  document.getElementById("mySidenav").style.width = "250px";
}

/*Close the sidenav the list of doctors when clicking on page*/
window.onclick = function(event) {

  if (!event.target.matches('#nav-btn') && !event.target.matches('.sidenav')) {
    document.getElementById("mySidenav").style.width = "0";
  }

  if (!event.target.matches('.dropdown-content') && !event.target.matches('#dropdown-btnId')) {

    if (document.getElementById("dropdown-contentId").classList.contains('show')) {
      document.getElementById("dropdown-contentId").classList.remove('show');
    }
  }
}
