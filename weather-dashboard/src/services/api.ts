import axios from "axios";

export const getWeather = async (lat: number, lon: number) => {
  const res = await axios.get(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relativehumidity_2m,precipitation,windspeed_10m,pm10,pm2_5&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&current_weather=true&timezone=auto`
  );
  return res.data;
};
export const getHistory = async (
  lat: number,
  lon: number,
  start: string,
  end: string
) => {
  const res = await axios.get(
    `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${start}&end_date=${end}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=auto`
  );

  return res.data;
};