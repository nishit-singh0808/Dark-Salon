import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Brush,
  CartesianGrid,
} from "recharts";

export default function TempChart({ data }: any) {
  const chartData = data.hourly.time.map((time: string, i: number) => ({
    time: time.slice(11, 16),
    temp: data.hourly.temperature_2m[i],
  }));

  return (
    <div style={{ overflowX: "auto" }}>
      <LineChart width={1000} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="temp" />

        {/* 🔥 THIS IS ZOOM FEATURE */}
        <Brush dataKey="time" height={30} stroke="#8884d8" />
      </LineChart>
    </div>
  );
}