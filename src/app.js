document.addEventListener("DOMContentLoaded", function () {
  const apiKey = "ded427803a02b2c16a56ae8b2197fa86"; // Replace with your actual API key
  const searchBtn = document.getElementById("searchBtn");
  const currentLocationBtn = document.getElementById("currentLocationBtn");
  const cityInput = document.getElementById("cityInput");
  const weatherDisplay = document.getElementById("weatherDisplay");
  const forecastDisplay = document.getElementById("forecastDisplay");
  const recentlySearchedDropdown = document.getElementById(
    "recentlySearchedDropdown"
  );

  // Load recently searched cities from local storage
  let recentlySearchedCities =
    JSON.parse(localStorage.getItem("recentlySearchedCities")) || [];

  // Function to save searched city to local storage
  function saveToLocalStorage(city) {
    if (!recentlySearchedCities.includes(city)) {
      recentlySearchedCities.unshift(city);
      localStorage.setItem(
        "recentlySearchedCities",
        JSON.stringify(recentlySearchedCities)
      );
    }
  }

  // Display recently searched cities
  function displayRecentlySearched() {
    recentlySearchedDropdown.innerHTML = "";
    recentlySearchedCities.forEach((city) => {
      const dropdownItem = document.createElement("a");
      dropdownItem.textContent = city;
      dropdownItem.href = "#";
      dropdownItem.addEventListener("click", function (event) {
        event.preventDefault();
        fetchWeatherData(city);
        fetchForecastData(city); // Fetch forecast when clicked
      });
      recentlySearchedDropdown.appendChild(dropdownItem);
    });
  }

  displayRecentlySearched(); // Display recently searched cities on page load

  // Event listener for search button
  searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city !== "") {
      fetchWeatherData(city);
      fetchForecastData(city);
      saveToLocalStorage(city); // Save searched city to local storage
      displayRecentlySearched(); // Update recently searched cities
    } else {
      alert("Please enter a city name.");
    }
  });

  // Event listener for current location button
  currentLocationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          fetchWeatherDataByCoords(latitude, longitude);
          fetchForecastDataByCoords(latitude, longitude);
        },
        (error) => {
          console.error("Error getting current location:", error);
          alert("Error getting current location. Please try again later.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  });

  // Function to fetch weather data by city name
  function fetchWeatherData(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        displayWeather(data);
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error);
        alert("Error fetching weather data. Please try again later.");
      });
  }

  // Function to fetch weather data by coordinates
  function fetchWeatherDataByCoords(latitude, longitude) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        displayWeather(data);
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error);
        alert("Error fetching weather data. Please try again later.");
      });
  }

  // Function to display weather data
  function displayWeather(data) {
    const cityName = data.name;
    const temperature = data.main.temp;
    const description = data.weather[0].description;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const iconCode = data.weather[0].icon;

    const weatherCard = `
            <div class="weather-card">
                <h2 class="align"><b>${cityName}</h2>
                <div class="weather-details">
                    <div class="weather-details-item">
                        <i class="fas fa-cloud-sun weather-icon"></i>
                        <p>${description}</p>
                    </div>
                    <div class="weather-details-item">
                        <p><i class="fas fa-thermometer-half humidity-icon"></i> Humidity: ${humidity}%</p>
                        <p><i class="fas fa-wind wind-icon"></i> Wind Speed: ${windSpeed} m/s</p>
                        <p><i class="fas fa-temperature-low"></i> Temperature: ${temperature}°C</p>
                    </div>
                </div>
            </div>
        `;

    weatherDisplay.innerHTML = weatherCard;

    // Change background based on weather conditions
    changeBackground(description);
  }

  // Function to fetch 5-day forecast data by city name
  function fetchForecastData(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        displayForecast(data);
      })
      .catch((error) => {
        console.error("Error fetching forecast data:", error);
        alert("Error fetching forecast data. Please try again later.");
      });
  }

  // Function to fetch 5-day forecast data by coordinates
  function fetchForecastDataByCoords(latitude, longitude) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        displayForecast(data);
      })
      .catch((error) => {
        console.error("Error fetching forecast data:", error);
        alert("Error fetching forecast data. Please try again later.");
      });
  }

  // Function to display 5-day forecast data
  function displayForecast(data) {
    const forecastData = data.list;
    let forecastHTML = "";

    forecastData.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString("en-US", { weekday: "short" });
      const time = date.toLocaleTimeString("en-US", { timeStyle: "short" });
      const temperature = item.main.temp;
      const description = item.weather[0].description;
      const iconCode = item.weather[0].icon;

      forecastHTML += `
                <div class="forecast-item">
                    <p>${day} ${time}</p>
                    <img src="http://openweathermap.org/img/wn/${iconCode}.png" alt="Weather Icon" class="weather-icon">
                    <p>${description}</p>
                    <p>${temperature}°C</p>
                </div>
            `;
    });

    forecastDisplay.innerHTML = forecastHTML;
  }

  // Function to change background based on weather conditions
  function changeBackground(description) {
    const body = document.body;
    switch (description.toLowerCase()) {
      case "clear sky":
        body.style.backgroundImage =
          "url('https://source.unsplash.com/1600x900/?sunny')";
        break;
      case "few clouds":
      case "scattered clouds":
      case "broken clouds":
        body.style.backgroundImage =
          "url('https://source.unsplash.com/1600x900/?cloudy')";
        break;
      case "shower rain":
      case "rain":
      case "thunderstorm":
        body.style.backgroundImage =
          "url('https://source.unsplash.com/1600x900/?rain')";
        break;
      case "snow":
        body.style.backgroundImage =
          "url('https://source.unsplash.com/1600x900/?snow')";
        break;
      default:
        body.style.backgroundImage =
          "url('https://source.unsplash.com/1600x900/?weather')";
        break;
    }
  }
});
