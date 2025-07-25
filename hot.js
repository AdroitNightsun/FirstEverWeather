const apiKey = config.apiKey;
const currentapiUrl = "https://api.openweathermap.org/data/2.5/weather?q=";
const currentapiUrlCoords = "https://api.openweathermap.org/data/2.5/weather?lat=";
const forcastapiUrl = "https://api.openweathermap.org/data/2.5/forecast?q=";
const forcastapiUrlCoords = "https://api.openweathermap.org/data/2.5/forecast?lat=";


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

// Add GPS button event listener
GpsBtn.addEventListener("click", function() {
  getCurrentLocationWeather();
});

// Helper function to get weather icon
function getWeatherIcon(weatherMain) {
  const weather = weatherMain.toLowerCase();
  if (weather === "clouds") return "light_rain.png";
  if (weather === "rain") return "rain.png";
  if (weather === "snow") return "snow.png";
  if (weather === "haze" || weather === "mist") return "haze.png";
  if (weather === "clear") return "sunny.png";
  if (weather === "thunderstorm") return "thunder.png";
  return "sunny.png";
}

// Helper function to get day name
function getDayName(dateString) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const date = new Date(dateString);
  return days[date.getDay()];
}

// Helper function to convert Kelvin to Celsius
function kelvinToCelsius(kelvin) {
  return Math.round(kelvin - 273.15);
}

// Function to get current location and fetch weather
async function getCurrentLocationWeather() {
  // Check if geolocation is supported
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by this browser.");
    return;
  }

  // Show loading state
  GpsBtn.textContent = "Getting location...";
  GpsBtn.disabled = true;

  // Get current position
  navigator.geolocation.getCurrentPosition(
    async function(position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      
      try {
        // Fetch weather data using coordinates
        const response = await fetch(currentapiUrlCoords + lat + `&lon=${lon}&appid=${apiKey}`);
        const currentdata = await response.json();
        
        const response2 = await fetch(forcastapiUrlCoords + lat + `&lon=${lon}&cnt=40&appid=${apiKey}`);
        const forcastdata = await response2.json();

        console.log(currentdata);
        console.log(forcastdata);

        // Process and display weather data
        displayWeatherData(currentdata, forcastdata);
        
      } catch (error) {
        console.error("Error fetching weather data:", error);
        document.getElementById("weatherContainer").innerHTML = `
            <div class="current_weather">
                <h1 class="location">Error: Could not fetch weather data</h1>
                <p>Please check your connection and try again.</p>
            </div>
        `;
      }
      
      // Reset button state
      GpsBtn.textContent = "use current location";
      GpsBtn.disabled = false;
    },
    function(error) {
      // Handle geolocation errors
      let errorMessage = "Error getting location: ";
      
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage += "Location access denied by user.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage += "Location information is unavailable.";
          break;
        case error.TIMEOUT:
          errorMessage += "Location request timed out.";
          break;
        default:
          errorMessage += "An unknown error occurred.";
          break;
      }
      
      alert(errorMessage);
      
      // Reset button state
      GpsBtn.textContent = "use current location";
      GpsBtn.disabled = false;
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  );
}

// Function to process and display weather data
function displayWeatherData(currentdata, forcastdata) {
    const weatherContainer = document.getElementById("weatherContainer");
    
    // Check if API returned valid data
    if (!currentdata || !currentdata.weather || !forcastdata || !forcastdata.list) {
        weatherContainer.innerHTML = `
            <div class="current_weather">
                <h1 class="location">Error: Invalid weather data</h1>
                <p>Please try again later.</p>
            </div>
        `;
        return;
    }
    const location = currentdata.name + ", " + currentdata.sys.country;
    
    // Current weather
    const weatherMain = currentdata.weather[0].main.toLowerCase();
    const weatherImg = getWeatherIcon(weatherMain);

    // Process forecast data - get daily forecasts
    const dailyForecasts = [];
    const processedDates = new Set();
    
    forcastdata.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0]; // Get date part only
        const time = item.dt_txt.split(' ')[1]; // Get time part
        
        // Skip if we already have this date, or if it's today
        if (processedDates.has(date) || processedDates.size >= 6) return;
        
        // Only take forecasts around noon (12:00) for daily representation
        if (time === '12:00:00' || time === '15:00:00') {
            dailyForecasts.push({
                date: date,
                day: getDayName(item.dt_txt),
                temp: kelvinToCelsius(item.main.temp),
                tempMin: kelvinToCelsius(item.main.temp_min),
                tempMax: kelvinToCelsius(item.main.temp_max),
                weather: item.weather[0].main,
                icon: getWeatherIcon(item.weather[0].main)
            });
            processedDates.add(date);
        }
    });

    // If we don't have enough daily forecasts, fill with available data
    if (dailyForecasts.length < 6) {
        const remainingSlots = 6 - dailyForecasts.length;
        let addedCount = 0;
        
        for (let i = 0; i < forcastdata.list.length && addedCount < remainingSlots; i++) {
            const item = forcastdata.list[i];
            const date = item.dt_txt.split(' ')[0];
            
            if (!processedDates.has(date)) {
                dailyForecasts.push({
                    date: date,
                    day: getDayName(item.dt_txt),
                    temp: kelvinToCelsius(item.main.temp),
                    tempMin: kelvinToCelsius(item.main.temp_min),
                    tempMax: kelvinToCelsius(item.main.temp_max),
                    weather: item.weather[0].main,
                    icon: getWeatherIcon(item.weather[0].main)
                });
                processedDates.add(date);
                addedCount++;
            }
        }
    }

    // Generate forecast HTML
    let forecastHTML = '';
    dailyForecasts.slice(0, 6).forEach((forecast, index) => {
        forecastHTML += `
            <li class="${['one', 'two', 'three', 'four', 'five', 'six'][index]}">
                <div class="day">${forecast.day}</div>
                <img src="${forecast.icon}" alt="${forecast.weather}" />
                <div class="temp_one">${forecast.tempMax}°C</div>
            </li>
        `;
    });

    weatherContainer.innerHTML = `
        <div class="current_weather">
            <h1 class="location">${location}</h1>
            <div class="meds">
                <img src="${weatherImg}" alt="" class="big_image"/>
                <div class="temp_main">
                    <h1>${kelvinToCelsius(currentdata.main.temp)}°C</h1>
                    <h3>feels like~${kelvinToCelsius(currentdata.main.feels_like)}°C</h3>
                </div>
            </div>
        </div>
        <div class="future_weather">
            <ul class="fw_list">
                ${forecastHTML}
            </ul>
        </div>
    `;
}

async function checkWeather(){
    const location = searchBox.value;
    
    if (!location) {
        alert("Please enter a location");
        return;
    }
    
    try {
        const response = await fetch(currentapiUrl + location + `&appid=${apiKey}`);
        const currentdata = await response.json();
        
        if (currentdata.cod === "404") {
            alert("Location not found. Please try again.");
            return;
        }
        
        const response2 = await fetch(forcastapiUrl + location + `&cnt=40&appid=${apiKey}`);
        const forcastdata = await response2.json();

        console.log(currentdata);
        console.log(forcastdata);

        // Process and display weather data
        displayWeatherData(currentdata, forcastdata);
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        document.getElementById("weatherContainer").innerHTML = `
            <div class="current_weather">
                <h1 class="location">Error: Could not fetch weather data</h1>
                <p>Please check the location name and try again.</p>
            </div>
        `;
    }
}