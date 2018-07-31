/*Profile location*/
function getCountry(inp, arr) {
  console.log(inp);
  let a, b, i, temp;
  let val = inp.value;
  closeAllLists(val);
  if (!val) return false;
  a = document.createElement("DIV");
  a.setAttribute("class", "autocomplete-items");
  inp.parentNode.appendChild(a);

  for (i = 0; i < arr.length; i++) {
    if (arr[i].substr(0, val.length).toUpperCase() === val.toUpperCase()) {
      b = document.createElement("DIV");
      b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
      b.innerHTML += arr[i].substr(val.length);
      b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
      b.addEventListener("click", function() {
        inp.value = this.getElementsByTagName("input")[0].value;
        closeAllLists();
      });
      a.appendChild(b);
    }
  }
}
function closeAllLists(elmnt) {
  let x = document.getElementsByClassName("autocomplete-items");
  let i;
  for (i = 0; i < x.length; i++) {
    if (elmnt != x[i]) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
}
 <div class="autocomplete">
          <% (function() { %>
            <% const countries = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua & Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia & Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Central Arfrican Republic","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cuba","Curacao","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Myanmar","Namibia","Nauro","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","North Korea","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre & Miquelon","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","St Kitts & Nevis","St Lucia","St Vincent","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad & Tobago","Tunisia","Turkey","Turkmenistan","Turks & Caicos","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States of America","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"]; %>
              <label for="country">Country</label>
              <input id="countryInput" oninput="getCountry(this, countries)" type="text" name="country">
          <% })(); %>
          <% (function() { %>
              <label for="state">State/Region</label>
              <input id="stateInput" oninput="getState(this, countries)" type="text" name="state">
          <% })(); %>
        </div>