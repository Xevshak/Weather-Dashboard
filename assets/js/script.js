const weatherKey= "e62f0a32a5023939f11ced97627f515c";
const locationKey= "BcIGMAXjwx5Zq6AekxGwxu4xMs64tzO0";

let storageList = [];
let cityInput = document.getElementById('city-name');
let saveBtn = document.getElementById('submit');
let searches = document.getElementById('saved-searches');
let main = document.getElementById('display-weather');

let storedData = JSON.parse(localStorage.getItem('userStorage'));
if (storedData!= null) {
    for (let data of storedData) {
        storageList.push(data);
        let list = document.createElement('li');
        list.setAttribute('class', 'list-group-item');
        let text = document.createElement('p');
        text.setAttribute("class", "d-inline-block");
        list.appendChild(text);
        text.textContent = data;
        text.addEventListener('click', function(event) {
            main.innerHTML = '';
            cityName = event.target.textContent;
            getWeather(cityName);
        });
        deleter(list);

    }
}
saveBtn.addEventListener('click', function(event) {
    event.preventDefault();
    cityName = '';
    main.innerHTML = '';
    cityName = cityInput.value;
    cityInput.value = "";
    getWeather(cityName);
    let list = document.createElement('li');
    list.setAttribute('class', 'list-group-item');
    let text = document.createElement('p');
    text.setAttribute("class", "d-inline-block");
    list.appendChild(text);
    text.textContent=cityName;
    text.addEventListener('click', function(event) {
        main.innerHTML = '';
        cityName= event.target.textContent;
        getWeather(cityName);
    });
deleter(list);
searches.appendChild(list);
storageList.push(list.textContent);
localStorage.setItem('userStorage', JSON.stringify(storageList));
});
function deleter(list) {
    let exitIcon = document.createElement('i');
exitIcon.setAttribute("class", "fas fa-times-circle ml-2 d-inline-block")
list.appendChild(exitIcon);
searches.appendChild(list);
exitIcon.addEventListener("click", function(event) {
    event.preventDefault();
    let newList = [];
    for (let element of storageList) {
        if (element !== event.target.parentElement.firstChild.textContent) { newList.push(element)
        } else { 
            break 
        };
    }
    localStorage.removeItem('userStorage');
    storageList = newList;
    localStorage.setItem('userStorage', JSON.stringify(storageList));
    event.target.parentElement.remove();
});
}
async function getCoordinates(cityName) {
    return new Promise(resolve => {
    namae = cityName.split(' ').filter(s => s).join(',');
    callLocAPI = `http://open.mapquestapi.com/geocoding/v1/address?key=${locationKey}&location=${namae}`
    fetch(callLocAPI)
    .then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                lat = data.results[0].locations[0].latLng.lat;
                lng = data.results[0].locations[0].latLng.lng;
                coords = [lat,lng];
                resolve (coords);
            });
        } else {
            alert("Please check your search term, no cities came up");
        }
    });
});
}

async function getWeather(cityName) {
    const coords = await getCoordinates(cityName);
    lat = coords[0]
    lng = coords[1]
    weatherAPI = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&exclude=hourly,minutely&appid=${weatherKey}`
    fetch(weatherAPI).then(function(response) {
		if (response.ok) {
			response.json().then(function(data) {
				let currentHumidity = data.current.humidity;
				let currentTemperature = Math.round((data.current.temp - 273.15) * (9 / 5) + 32);
				let currentUVI = data.current.uvi;
                let uvicolors;
                if (currentUVI >= 8) uvicolors = "background-color: red; color: white;";
                else if (currentUVI >= 6) uvicolors = "background-color: orange; color: white;";
                else if (currentUVI >= 3) uvicolors = "background-color: yellow; color: black;";
				let currentDateTime = new Date(data.current.dt * 1000);
				let currentDate = currentDateTime.toLocaleDateString('en-US');
				let currentDay = currentDateTime.getDay();
				if (currentDay === 1) currentDay = 'Monday';
				else if (currentDay === 2) currentDay = 'Tuesday';
				else if (currentDay === 3) currentDay = 'Wednesday';
				else if (currentDay === 4) currentDay = 'Thursday';
				else if (currentDay === 5) currentDay = 'Friday';
				else if (currentDay === 6) currentDay = 'Saturday';
				else if (currentDay === 0) currentDay = 'Sunday';
				let currentWind = Math.round(data.current.wind_speed);
				let currentDescription = data.current.weather[0].description;
				let currentIcon = data.current.weather[0].icon;
				let currentIconURL = `http://openweathermap.org/img/wn/${currentIcon}@2x.png`;
				let currentStatus = data.current.weather[0].main;
				let currentWeatherResults = document.createElement('div');
				currentWeatherResults.setAttribute('class', 'container d-flex justify-content-center');
				currentWeatherResults.setAttribute('style', 'max-width: 52rem;');
				currentWeatherResults.innerHTML = `
                <div class="card mb-3" style="min-width: 30rem;">
                    <div class="container">
                        <div class="card-body row d-flex justify-content-center text-center">
                            <h3 class="col-12 card-title">${cityName}</h3>
                            <p class="col-12 card-text"><small class="text-muted">${currentDay} ${currentDate}</small></p>
                            <div class="row col-12 text-center d-flex justify-content-around align-center">
                                <div class="row d-flex justify-content-center col-12 icon-container align-self-center" style="max-width: 30rem; max-height: 30rem;"> 
                                    <img class="col-12 text-center pb-0 mb-0" style="max-height: 10rem; max-width: 10rem; filter: sepia(100%); " src="${currentIconURL}" alt="current weather icon">
                                    <p class="col-12 card-text text-center status-text-main status pt-0 mt-0">${currentDescription}</p>
                                </div>
                                <div class="card-body align-self-center">
                                    <p class="card-text current-details">Temp: ${currentTemperature} \xB0F</p>
                                    <p class="card-text current-details" style = "${uvicolors}" id="uv-index">UVI: ${currentUVI}</p>
                                    <p class="card-text current-details">Humidity: ${currentHumidity}%</p>
                                    <p class="card-text current-details">Wind: ${currentWind} mph</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
				main.appendChild(currentWeatherResults);
				let dailyWeather = document.createElement('div');
				dailyWeather.setAttribute('class', 'container d-flex justify-content-center flex-wrap');
				main.appendChild(dailyWeather);
				let uvIndex = document.getElementById('uv-index');
				for (let i = 1; i < 6; i++) {
					let dailyHumidity = data.daily[i].humidity;
					let dailyMax = Math.round((data.daily[i].temp.max - 273.15) * (9 / 5) + 32);
					let dailyMin = Math.round((data.daily[i].temp.min - 273.15) * (9 / 5) + 32);
					let dailyDate = new Date(data.daily[i].dt * 1000);
					dailyDate = dailyDate.getDay();
					if (dailyDate === 1) dailyDate = 'Monday';
					else if (dailyDate === 2) dailyDate = 'Tuesday';
					else if (dailyDate === 3) dailyDate = 'Wednesday';
					else if (dailyDate === 4) dailyDate = 'Thursday';
					else if (dailyDate === 5) dailyDate = 'Friday';
					else if (dailyDate === 6) dailyDate = 'Saturday';
					else if (dailyDate === 0) dailyDate = 'Sunday';
					let dailyWind = Math.round(data.daily[i].wind_speed);
					let dailyDescription = data.daily[i].weather[0].description;
					let properDailyDescription = '';
					let dailyStatusArr = dailyDescription.split(' ');
					if (dailyStatusArr.length === 1) {
						let lowers2 = dailyStatusArr[0].slice(1);
						let upper2 = dailyStatusArr[0][0].toUpperCase();
						properDailyDescription = properDailyDescription.concat(upper2);
						properDailyDescription = properDailyDescription.concat(lowers2);
					} else {
						for (let j = 0; j < dailyStatusArr.length; j++) {
							let lowers2 = dailyStatusArr[j].slice(1);
							let upper2 = dailyStatusArr[j][0].toUpperCase();
							if (j === dailyStatusArr.length - 1) {
								properDailyDescription = properDailyDescription.concat(upper2);
								properDailyDescription = properDailyDescription.concat(lowers2);
							} else {
								properDailyDescription = properDailyDescription.concat(upper2);
								properDailyDescription = properDailyDescription.concat(lowers2);
								properDailyDescription = properDailyDescription.concat(' ');
							}
						}
					}
					let dailyIcon = data.daily[i].weather[0].icon;
					let dailyIconURL = `http://openweathermap.org/img/wn/${dailyIcon}@2x.png`;
					let dailyWeatherDiv = document.createElement('div');
					dailyWeatherDiv.innerHTML = `
                    <div class="card border-warning mb-3" style="max-width: 10rem; min-width: 10rem; height: 450px;">
                        <div class="card-header bg-transparent text-center border-warning text-center">
                            ${dailyDate}
                        </div>
                        <div>
                            <div class="text-center">
                                <div class="icon-container" style="max-width: 18rem"> 
                                    <img class="col-12 text-center pb-0 mb-0" style="filter: sepia(100%);" src="${dailyIconURL}" alt="daily weather icon">
                                    <p class="col-12 card-text text-center status status-text pt-0 mt-0">${properDailyDescription}</p>
                                </div>
                                <div class="text-center align-content-center card-body">
                                        <p class="card-text">High: ${dailyMax} \xB0F</p>
                                        <p class="card-text">Low: ${dailyMin} \xB0F</p>
                                        <p class="card-text">Wind: ${dailyWind} mph</p>
                                        <p class="card-text">Humidity: ${dailyHumidity}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
					dailyWeather.appendChild(dailyWeatherDiv);
				}
			});
		} else {
			alert("Oh No! Something went wrong! Please REFRESH the page and try again!")
		}
	});
}
