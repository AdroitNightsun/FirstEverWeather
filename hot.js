const apiKey = "0a6a1fd22a2c4a5439899586da79a51f";
const currentapiUrl = "https://api.openweathermap.org/data/2.5/weather?q=";
const forcastapiUrl = "https://api.openweathermap.org/data/2.5/forecast?q=";

const searchBox = document.querySelector(".search_input");
const searchBtn = document.querySelector(".search_btn");
const GpsBtn = document.querySelector(".gps_btn");
const LocationDis = document.querySelector(".location");
const tempDis = document.querySelector(".temp_main");
const mainImg = document.querySelector(".big_image");

document.querySelector(".search_input").addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    checkWeather();
  }
});
async function checkWeather(){
    const location = searchBox.value;
    const response = await fetch(currentapiUrl + location + `&appid=${apiKey}`);
    var currentdata = await response.json();
    
    const response2 = await fetch(forcastapiUrl + location + `&cnt=6&appid=${apiKey}`);
    var forcastdata = await response2.json();

    console.log(currentdata);
    console.log(Math.round((currentdata.main.temp)-273.15));
    console.log(forcastdata);

    const weatherMain = currentdata.weather[0].main.toLowerCase();
    let weatherImg = "sunny.png";
    if (weatherMain === "clouds") {
      weatherImg = "clouds.png";
    } else if (weatherMain === "rain") {
      weatherImg = "rain.png";
    } else if (weatherMain === "snow") {
      weatherImg = "snow.png";
    } else if (weatherMain === "haze" || weatherMain === "mist") {
      weatherImg = "haze.png";
    } else if (weatherMain === "clear") {
      weatherImg = "sunny.png";
    }



    document.querySelector(".cuntainer").innerHTML = `<div class="current_weather">
        <h1 class="location">${location}</h1>
        <div class="meds">
          <img src="${weatherImg}" alt="" class="big_image"/>
          <div class="temp_main">
            <h1>${Math.round((currentdata.main.temp)-273.15)}°C</h1>
            <h3>feels like~${Math.round((currentdata.main.feels_like)-273.15)}°C</h3>
          </div>
        </div>
      </div>
      <div class="future_weather">
        <ul class="fw_list">
          <li class="one">
            <div class="day">mon</div>
            <img src="clouds.png" alt="" />
            <div class="temp_one">30°c / 40°c</div>
          </li>
          <li class="two">
            <div class="day">mon</div>
            <img src="clouds.png" alt="" />
            <div class="temp_one">30°c / 40°c</div>
          </li>
          <li class="three">
            <div class="day">mon</div>
            <img src="clouds.png" alt="" />
            <div class="temp_one">30°c / 40°c</div>
          </li>
          <li class="four">
            <div class="day">mon</div>
            <img src="clouds.png" alt="" />
            <div class="temp_one">30°c / 40°c</div>
          </li>
          <li class="five">
            <div class="day">mon</div>
            <img src="clouds.png" alt="" />
            <div class="temp_one">30°c / 40°c</div>
          </li>
          <li class="six">
            <div class="day">mon</div>
            <img src="clouds.png" alt="" />
            <div class="temp_one">30°c / 40°c</div>
          </li>
        </ul>
      </div>`
}
