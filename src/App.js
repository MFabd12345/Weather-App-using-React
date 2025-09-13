import React, { useState } from "react";
import "./App.css";

const API_KEY = "ce48956bd2582f23ea5cd2fbff0585a0";

const App = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [textColor, setTextColor] = useState("black");
  const [bgColor, setBgColor] = useState("#eeeeee");

  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem("searchHistory");
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);

  const cityFixes = {
    tuticorin: "Thoothukudi",
  };

  const fetchWeather = async (cityName = city) => {
    if (!cityName) return;

    const fixedCity = cityFixes[cityName.toLowerCase()] || cityName;

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${fixedCity}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();

      if (data.cod === "404") {
        setWeather({ cod: "404" });
      } else {
        setWeather(data);

        setSearchHistory((prev) => {
          const updated = [
            fixedCity,
            ...prev.filter((c) => c !== fixedCity),
          ].slice(0, 10);
          localStorage.setItem("searchHistory", JSON.stringify(updated));
          return updated;
        });

        const temp = data.main.temp;
        let bg = "#eeeeee";

        if (temp <= 10) bg = "#00bfff";
        else if (temp <= 25) bg = "#6dd5ed";
        else if (temp <= 35) bg = "#fcb045";
        else bg = "#ff4e50";

        setBgColor(bg);
        setTextColor("white");
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      fetchWeather();
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("⚠️ Sorry! Voice input is only supported in Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const spokenCity = event.results[0][0].transcript;
      setCity(spokenCity);          // ✅ updates input box
      fetchWeather(spokenCity);     // ✅ auto search
    };

    recognition.onerror = (err) => {
      console.error("Speech recognition error:", err);
      alert("🎤 Could not recognize your voice. Please try again.");
    };

    recognition.start();
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const toggleTextColor = () => {
    setTextColor((prev) => (prev === "white" ? "black" : "white"));
  };

  const toggleHistory = () => {
    setShowHistory((prev) => !prev);
  };

  const getLocalDateTime = (dt, timezone) => {
    if (!dt || typeof timezone !== "number") return "";
    const utc = dt * 1000;
    const offset = timezone * 1000;
    const localDate = new Date(utc + offset);
    return localDate.toUTCString();
  };

  return (
    <div
      className={`app ${isDarkMode ? "dark-mode" : ""}`}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <h1>Weather App 🌦️</h1>

      <div className="input-group">
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={() => fetchWeather()}>Search</button>
        <button onClick={handleVoiceInput}>🎤</button>
        <button onClick={toggleDarkMode}>
          {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {weather && weather.cod === "404" && (
        <p style={{ color: "red" }}>❌ City not found. Please try again.</p>
      )}

      {weather && weather.cod !== "404" && (
        <div className="weather-box">
          <h2>{weather.name}</h2>
          <p>{getLocalDateTime(weather.dt, weather.timezone)}</p>
          <img
            src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt="weather icon"
          />
          <p>{weather.weather[0].description}</p>
          <p>🌡 Temp: {weather.main.temp}°C</p>
          <p>💧 Humidity: {weather.main.humidity}%</p>
          <p>🌬 Wind: {weather.wind.speed} m/s</p>
        </div>
      )}

      <button onClick={toggleTextColor} className="toggle-text-color">
        Toggle Text Color
      </button>

      <button onClick={toggleHistory} className="toggle-history">
        {showHistory ? "Hide History" : "Show History"}
      </button>

      {showHistory && searchHistory.length > 0 && (
        <div className="history">
          <h3>Previous Searches</h3>
          <ul>
            {searchHistory.map((item, index) => (
              <li
                key={index}
                onClick={() => {
                  setCity(item);        // ✅ update input box
                  fetchWeather(item);   // ✅ fetch weather
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
