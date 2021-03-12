let body = document.querySelector('body');
let icon = document.querySelector('.icon');
let loc = document.getElementById('location');
let date = document.getElementById('date');
let desc = document.getElementById('desc');

let today = new Date().toLocaleDateString();
let weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Monday', 'Saturday', 'Sunday'];
let weekday = weekdays[new Date().getDay()-1];

let tempSection = document.getElementById('temp-section');

let isCelsius = true;
let city = 'Vancouver';

document.addEventListener("DOMContentLoaded", ()=>{
    setTimeout(() => {
        $(".loader-wrapper").fadeOut("slow");;
        }, 2000)
    
});

window.addEventListener('load', () => {
    fetchAPI(false, city);
    // setInterval(() => {
    //     console.log('UPDATE');
    // console.log(city);

    //     fetchAPI(true, city);
    // }, 120000);
});

window.addEventListener('keypress', (e) => {
    if(e.key === 'Enter'){
        e.preventDefault();

        let input = document.getElementById('search-text');
        city = input.value;
        input.value = '';
        console.log(city);
        fetchAPI(true, city);
        closeSearchSection();
    }
})

function fetchAPI(update = false, city){
    const apikey = '0a7e7f9075784501a4b3d8f31e73588a';
    const api = `https://api.openweathermap.org/data/2.5/weather?q=${city.replace(' ','').toLowerCase()}&appid=${apikey}`;
    console.log(api);
    fetch(api)
    .then(response => {
        if(response.status !== 200){
            console.log('There is an issue. Status code:' + response.status);
            showPopup(city);
            return;
        }
        return response.json();
    }).then(data => {
        if(data) setElements(data, update);
    })
    .catch(e => {
        console.log('Fetch error: ' + e);
    })
}

function setElements(data, update = false){
    const currentWeather = data.weather[0];
    
    console.log(currentWeather.icon);
    if(icon) setIcon(icons.get(currentWeather.icon).name, icon);
    console.log(icons.get(currentWeather.icon).bg);
    body.style.backgroundImage = `url('${icons.get(currentWeather.icon).bg}')`;

    loc.textContent = `${data.name}, ${data.sys.country}`;

    date.textContent = `${weekday} ${today}`;

    desc.textContent = currentWeather.main;

    fillInfo(data);

    checkUnit(data.main, update);

    tempSection.addEventListener('click', () => {
        console.log('click');
        checkUnit(data.main, update);
    })

}

function setIcon(id, icon){
    const skycons = new Skycons({color: "white"});
    skycons.play();
    return skycons.set(icon, Skycons[id]);
}

function fillInfo(data){
    let values = {"sunrise" : `${new Date(data.sys.sunrise*1000).getHours()} : ${new Date(data.sys.sunrise*1000).getMinutes()}`,
                "sunset" : `${new Date(data.sys.sunset*1000).getHours()} : ${new Date(data.sys.sunset*1000).getMinutes()}`,
                "feels-like" : data.main.feels_like,
                "wind" : `${data.wind.speed} m/s`,
                "pressure" :  `${data.main.pressure} hPa`,
                "humidity" :  `${data.main.humidity} %`};

    for (const [k,v] of Object.entries(values)) {
        let el = document.getElementById(k);
        el.textContent = v;
    }
}

function checkUnit(data, update){
    let degree = document.getElementById('degree');
    let unit = document.getElementById('unit');
    let minMax = document.getElementById('min-max');
    let feelslike = document.getElementById('feels-like');

    let temps = {"degree":degree, "unit":unit, "minMax":minMax, "feelslike":feelslike};

    if(update){
        isCelsius ? setCelsius(data, temps) : setFarenheit(data, temps);
    }else{
        if(isCelsius){
            isCelsius = false;
            setFarenheit(data, temps);
        }else{
            isCelsius = true;
            setCelsius(data, temps);
        }
    }
   
}

function setCelsius(data, temps){
    temps["unit"].textContent = '°C';
    temps["degree"].textContent = Math.round(data.temp-273.15);
    temps["minMax"].textContent = `${Math.round(data.temp_min-273.15)} °C / ${Math.round(data.temp_max-273.15)} °C`;
    temps["feelslike"].textContent = `${Math.round(data.feels_like-273.15)} °C `;
}

function setFarenheit(data, temps){
    temps["unit"].textContent = '°F';
    temps["degree"].textContent = Math.round(data.temp * 9/5 - 459.67);
    temps["minMax"].textContent = `${Math.round(data.temp_min * 9/5 - 459.67)} °F / ${Math.round(data.temp_max * 9/5 - 459.67)} °F`;
    temps["feelslike"].textContent = `${Math.round(data.feels_like * 9/5 - 459.67)} °F`;
}

let title = document.querySelector('.title');
let searchIcon = document.querySelector('.search-icon');
let searchSection = document.querySelector('.search-section');
searchIcon.addEventListener('click', (e) => {
    let visibility = searchSection.style.visibility;
    if(visibility === 'visible'){
        closeSearchSection();
    }else{
        openSearchSection();
    }
    console.log(searchSection.style.visibility);
})

function closeSearchSection(){
    title.style.visibility = 'visible';    
    searchSection.style.visibility = 'hidden';
    searchSection.style.opacity = 0;
    searchIcon.classList.remove('far');
    searchIcon.classList.remove('fa-times-circle');
    searchIcon.classList.add('fas');
    searchIcon.classList.add('fa-search');
}

function openSearchSection(){
    title.style.visibility = 'hidden';    
    searchSection.style.visibility = 'visible';
    searchSection.style.opacity = 1;
    searchIcon.classList.remove('fas');
    searchIcon.classList.remove('fa-search');
    searchIcon.classList.add('far');
    searchIcon.classList.add('fa-times-circle');
}

function showPopup(city){
    let popup = document.querySelector('.popup-section');
    popup.style.visibility = 'visible';
    popup.style.opacity = 1;
    
    let message = document.querySelector('.message');
    message.textContent = `City ${city} cannot be found.`
    
    let closeBtn = document.querySelector(".close-btn");
    closeBtn.addEventListener('click', (e) => {
        popup.style.visibility = 'hidden'; 
        popup.style.opacity = 0; 
    });
}

let moreSection = document.querySelector('.more-section');
let chevron = document.querySelector('.chevron');
moreSection.addEventListener('click', (e) => {
    if(chevron.classList.contains('fa-chevron-up')){
        moreSection.style.top = '50%';
        chevron.classList.remove('fa-chevron-up');
        chevron.classList.add('fa-chevron-down');
        searchIcon.style.pointerEvents = "none";
    }else{
        moreSection.style.top = '98%';
        chevron.classList.remove('fa-chevron-down');
        chevron.classList.add('fa-chevron-up');
        searchIcon.style.pointerEvents = "all";
    }
});

moreSection.addEventListener('mouseover', (e) => {
    if(chevron.classList.contains('fa-chevron-up')){
        moreSection.style.top = '97%';
    }
});

moreSection.addEventListener('mouseout', (e) => {
    if(chevron.classList.contains('fa-chevron-up')){
        moreSection.style.top = '98%';
    }
});

//Autocomplete
function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("div");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("div");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
            b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                fetchAPI(true, inp.value);
                inp.value = '';
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
                closeSearchSection();
            });
            a.appendChild(b);
          }
        }
    });
  
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
  }

 /*An array containing all the city names*/
let countrylist = []

//   fetch("city.list.json")
  fetch("cities.json")
    .then(response => {
        if(response.status !== 200){
            console.log('There is an issue. Status code:' + response.status);
            showPopup('file');
            return;
        }
        return response.json();
    })
    .then(data => {
        for (const d of data) {
           //add just cities => add just object, which state is not empty
        //    if(!countrylist.includes(`${d.name},${d.country}`)){
                countrylist.push(`${d.name},${d.country}`);
        //    }
        }
    })
    .catch(e => {
        console.log('Fetch Cities error: ' + e);
    })
  /*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
  autocomplete(document.getElementById("search-text"), countrylist);