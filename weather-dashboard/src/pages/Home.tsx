import { useEffect, useState } from "react";
import useLocation from "./../hooks/useLocation";
import { getWeather } from "./../services/api";
import WeatherCard from "./../components/WeatherCard";
import TempChart from "./../components/TempChart";

function App() {
  console.log("App is running 🚀"); // ✅ moved inside

  const location = useLocation();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    console.log("useEffect triggered 🔥");
    console.log("Location:", location);

    if (location) {
      getWeather(location.lat, location.lon).then(setData);
    }
  }, [location]);

  if (!data) return <h2>Loading... ⏳</h2>;

return (
  <div>
    <h1>Weather Dashboard 🌦️</h1>

    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
      <WeatherCard
        title="Temperature"
        value={data.current_weather.temperature + "°C"}
      />
      <WeatherCard
        title="Wind Speed"
        value={data.current_weather.windspeed + " km/h"}
      />
      <WeatherCard
        title="Humidity"
        value={data.hourly.relativehumidity_2m[0] + "%"}
      />
      <TempChart data={data} />
    </div>
  </div>
);
}

export default App;