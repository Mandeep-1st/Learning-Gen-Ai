"use client";
import React, { useState } from "react";

export default function Weather() {
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  async function fetchWeather() {
    setWeather(null);
    setError(null);
    try {
      // 1. Get city coordinates using Nominatim
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
      );
      const geoData = await geoRes.json();
      if (!geoData.length) {
        setError("City not found.");
        return;
      }
      const { lat, lon } = geoData[0];

      // 2. Fetch weather from Open-Meteo
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      );
      const weatherData = await weatherRes.json();
      if (!weatherData.current_weather) {
        setError("No weather data found.");
        return;
      }
      setWeather({
        temp: weatherData.current_weather.temperature,
        wind: weatherData.current_weather.windspeed,
        weathercode: weatherData.current_weather.weathercode,
        city: geoData[0].display_name.split(",")[0]
      });
    } catch (err) {
      setError("Failed to fetch weather data.");
    }
  }

  return (
    <div style={{ maxWidth: 350, margin: "auto", padding: 20 }}>
      <h2>Weather Info</h2>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Enter city"
        style={{ width: "80%", padding: 8 }}
      />
      <button onClick={fetchWeather} style={{ marginLeft: 8, padding: 8 }}>
        Get Weather
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {weather && (
        <div style={{ marginTop: 16 }}>
          <p>
            <b>{weather.city}</b>
          </p>
          <p>
            Temperature: <b>{weather.temp}°C</b>
          </p>
          <p>Wind Speed: {weather.wind} km/h</p>
        </div>
      )}
    </div>
  );
}
