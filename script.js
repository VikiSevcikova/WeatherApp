const body = document.querySelector('body');
const icon = document.querySelector('.icon');
const loc = document.getElementById('location');
const date = document.getElementById('date');
const desc = document.getElementById('desc');
const slider = document.querySelector(".slider");

let today = new Date().toLocaleDateString();
let weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Monday', 'Saturday', 'Sunday'];
let weekday = weekdays[new Date().getDay()-1];

let tempSection = document.getElementById('temp');
//when the temperature is clicked => change the unit, also in the 'more' section
tempSection.addEventListener('click', () => {
    console.log('click');
    setTemperature();
})

let isCelsius = true;
let city = 'Vancouver';

//when the document is loaded, the loader disapears
document.addEventListener("DOMContentLoaded", ()=>{
    setTimeout(() => {
        $(".loader-wrapper").fadeOut("slow");;
        }, 1000)
    
});

window.addEventListener('load', () => {
    fetchAPI(city);
    setInterval(() => {
        console.log('UPDATE');
        console.log(city);

        fetchAPI(city);
    }, 120000);
});


function fetchAPI(city){
    const apikey = config.API_KEY;
    const api = `https://api.openweathermap.org/data/2.5/weather?q=${city.replace(' ','').toLowerCase()}&appid=${apikey}&units=metric`;
    console.log(api);
    fetch(api)
    .then(response => {
        //if the response code is different from 200 the popup message opens 
        if(response.status !== 200){
            console.log('There is an issue. Status code:' + response.status);
            showPopup(city);
            return;
        }
        return response.json();
    }).then(data => {
        //if there is data is not empty then set elements 
        if(data) setElements(data);
    })
    .catch(e => {
        console.log('Fetch error: ' + e);
    })
}

function setElements(data){
    setCurrentWeather(data);
    setForecastWeather();
}

function setCurrentWeather(data){
    //get todays weather
    const currentWeather = data.weather[0];

    //set weather icon based on the currentWeather.icon code from the api, in icon.js is the mapping for icons
    setIcon(icons.get(currentWeather.icon).name, icon);
    console.log(icons.get(currentWeather.icon).bg);
    //bg image is also different based on the currentWeather.icon
    body.style.backgroundImage = `url('${icons.get(currentWeather.icon).bg}')`;

    //set the location
    loc.textContent = `${data.name}, ${data.sys.country}`;
    //set the week day and the date
    date.textContent = `${weekday} ${today}`;
    //description of the weather
    desc.textContent = currentWeather.main;
    //set the data in 'more' section
    fillInfo(data);
    //check unit
    checkUnit(data.main);
}

function setForecastWeather(){
    const apikey = config.API_KEY;
    const api = `https://api.openweathermap.org/data/2.5/forecast?q=${city.replace(' ','').toLowerCase()}&appid=${apikey}&units=metric`;
    console.log(api);
    fetch(api)
    .then(response => {
        //if the response code is different from 200 the popup message opens 
        if(response.status !== 200){
            console.log('There is an issue. Status code:' + response.status);
            showPopup(city);
            return;
        }
        return response.json();
    }).then(data => {
        //if there is data is not empty then set elements 
        slider.innerHTML = '';
        if(data) data.list.map((d) => createCard(d))
    })
    .catch(e => {
        console.log('Fetch error: ' + e);
    })
}

function createCard(forecast){
    const {main, weather} = forecast
    let date = new Date(forecast.dt*1000).toLocaleDateString(navigator.language);
    let time = new Date(forecast.dt*1000).toLocaleTimeString(navigator.language, {
        hour: '2-digit',
        minute:'2-digit'
      });
    const card = document.createElement('div');
    card.classList.add("card");

    const iconCanvas = document.createElement('canvas');
    iconCanvas.classList.add("icon");
    iconCanvas.style.width  =  "128px";
    iconCanvas.style.height  = "80px";
    setIcon(icons.get(weather[0].icon).name, iconCanvas);

    card.appendChild(iconCanvas);
    const weatherDetails = document.createElement('div');
    weatherDetails.classList.add('weather-details');

    weatherDetails.innerHTML = `<h4 id="date">${date}</h4>
    <h4 id="date">${time}</h4>
    <div class="temp-section">
        <h2 class="temperature" id="degree">${isCelsius ? Math.round(main.temp) + ' °C' : Math.round((main.temp * 1.8) + 32) + '°F'} </h2>
    </div>
    <h4 id="desc">${weather[0].main}</h4>
    <div class="temp-section">
        <h4 class="temperature" id="min">${isCelsius ? Math.round(main.temp_min) + ' °C' : Math.round((main.temp_min * 1.8) + 32) + '°F'}</h4>
        <h4> / </h4>
        <h4 class="temperature" id="max">${ isCelsius ? Math.round(main.temp_max) + ' °C' : Math.round((main.temp_max * 1.8) + 32) + '°F'}</h4>
    </div>`;
    card.appendChild(weatherDetails);
    slider.appendChild(card);
}

function setIcon(id, icon){
    const skycons = new Skycons({color: "white"});
    skycons.play();
    return skycons.set(icon, Skycons[id]);
}

function fillInfo(data){
    let sunrise = new Date(data.sys.sunrise*1000).toLocaleTimeString(navigator.language, {
        hour: '2-digit',
        minute:'2-digit'
      });
      let sunset = new Date(data.sys.sunset*1000).toLocaleTimeString(navigator.language, {
        hour: '2-digit',
        minute:'2-digit'
      });
    let values = {"sunrise" : `${sunrise}`,
                "sunset" : `${sunset} `,
                "feels-like" : data.main.feels_like,
                "wind" : `${data.wind.speed} m/s`,
                "pressure" :  `${data.main.pressure} hPa`,
                "humidity" :  `${data.main.humidity} %`};
    //get the element by the key and set the value
    for (const [k,v] of Object.entries(values)) {
        let el = document.getElementById(k);
        el.textContent = v;
    }
}

//check which unit is set, and change the values
function checkUnit(data){
    let degree = document.getElementById('degree');
    let unit = document.getElementById('unit');
    let min = document.getElementById('min');
    let max = document.getElementById('max');
    let feelslike = document.getElementById('feels-like');

    let temps = {"degree":degree, "unit":unit, "max":max, "min":min, "feelslike":feelslike};

    setTempData(data, temps);
}

function setTemperature(){
    const temperatures = Array.from(document.querySelectorAll(".temperature"));

    if(isCelsius){
        temperatures.map((temperature) => setFarenheit(temperature));
    }else{
        temperatures.map((temperature) => setCelsius(temperature));
    }

    isCelsius ? isCelsius = false : isCelsius = true;

    // temperatures.map(temperature => {
    //     isCelsius ? setFarenheit(temperature.textContent) : setFarenheit(temperature.textContent);
    // });
}

function setCelsius(temperature){
    let t = temperature.textContent.split('°')[0];
    temperature.textContent = Math.round((t - 32) * 0.5556) + '°C';
}

function setFarenheit(temperature){
    let t = temperature.textContent.split('°')[0];
    temperature.textContent =  Math.round((t * 1.8) + 32) + '°F';
}

function setTempData(data, temps){
    temps["degree"].textContent = isCelsius ? Math.round(data.temp) + ' °C' : Math.round((data.temp * 1.8) + 32) + '°F';
    temps["min"].textContent = isCelsius ? Math.round(data.temp_min) + ' °C' : Math.round((data.temp_min * 1.8) + 32) + '°F';
    temps["max"].textContent = isCelsius ? Math.round(data.temp_max) + ' °C' : Math.round((data.temp_max * 1.8) + 32) + '°F';
    temps["feelslike"].textContent = isCelsius ? Math.round(data.feels_like) + ' °C' : Math.round((data.feels_like * 1.8) + 32) + '°F';
}

let title = document.querySelector('.title');
let searchIcon = document.querySelector('.search-icon');
let searchSection = document.querySelector('.search-section');
//when the search icon is clicked change the visibility of the section and also the icon
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
    body.style.overflow = 'none';
    title.style.visibility = 'visible';    
    searchSection.style.visibility = 'hidden';
    searchSection.style.opacity = 0;
    searchIcon.classList.remove('far');
    searchIcon.classList.remove('fa-times-circle');
    searchIcon.classList.add('fas');
    searchIcon.classList.add('fa-search');
}

function openSearchSection(){
    body.style.overflow = 'hidden';
    title.style.visibility = 'hidden';    
    searchSection.style.visibility = 'visible';
    searchSection.style.opacity = 1;
    searchIcon.classList.remove('fas');
    searchIcon.classList.remove('fa-search');
    searchIcon.classList.add('far');
    searchIcon.classList.add('fa-times-circle');
}

//change the visibility of the popup section, with the message, and if it is closed, set the section to hidden
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
let info = document.querySelector('.info');
let chevron = document.querySelector('.chevron');
//change the position of the 'more' section and also the icon 
moreSection.addEventListener('click', (e) => {
    if(chevron.classList.contains('fa-chevron-up')){
        moreSection.style.top = '50%';
        chevron.classList.remove('fa-chevron-up');
        chevron.classList.add('fa-chevron-down');
        searchIcon.style.pointerEvents = "none";
        info.style.visibility = 'visible';
    }else{
        moreSection.style.top = '98%';
        chevron.classList.remove('fa-chevron-down');
        chevron.classList.add('fa-chevron-up');
        searchIcon.style.pointerEvents = "all";
        info.style.visibility = 'hidden';

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


window.addEventListener('keypress', (e) => {
    if(e.key === 'Enter'){
        e.preventDefault();

        let input = document.getElementById('search-text');
        city = input.value;
        input.value = '';
        console.log(city);
        fetchAPI(city);
        closeSearchSection();
    }
})

function autocomplete(inp, arr) {
    //two arguments: the text field element and an array of possible autocompleted values:
    inp.addEventListener("input", function(e) {
        var list, item, i, val = this.value;
        //close any already open lists of autocompleted values
        closeAllLists();
        if (!val) { return false;}
        //create a DIV element that will contain the items (values):
        list = document.createElement("div");
        list.setAttribute("id", this.id + "autocomplete-list");
        list.setAttribute("class", "autocomplete-items");
        //append the DIV element as a child of the autocomplete container:
        this.parentNode.appendChild(list);
        
        for (i = 0; i < arr.length; i++) {
          //check if the item starts with the same letters as the text field value:
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            //create a DIV element for each matching element:
            item = document.createElement("div");
            //make the matching letters bold:
            item.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            item.innerHTML += arr[i].substr(val.length);
            //insert a input field that will hold the current array item's value:
            item.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            //execute a function when someone clicks on the item value:
            item.addEventListener("click", function(e) {
                //insert the value for the autocomplete text field:
                inp.value = this.getElementsByTagName("input")[0].value;
                //call fetchAPI function to get the item/city
                city = inp.value;
                fetchAPI(city);
                inp.value = '';
                //close the list of autocompleted values, (or any other open lists of autocompleted values)
                closeAllLists();
                closeSearchSection();
            });
            list.appendChild(item);
          }
        }
    });
  
    function closeAllLists(elmnt) {
      //close all autocomplete lists in the document, except the one passed as an argument:
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    //execute a function when someone clicks in the list
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
  }

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
        //    if(!countrylist.includes(`${d.name},${d.country}`)){
                countrylist.push(`${d.name},${d.country}`);
        //    }
        }
    })
    .catch(e => {
        console.log('Fetch Cities error: ' + e);
    })
  //initiate the autocomplete function on the element, and pass along the countries array as possible autocomplete values:
  autocomplete(document.getElementById("search-text"), countrylist);