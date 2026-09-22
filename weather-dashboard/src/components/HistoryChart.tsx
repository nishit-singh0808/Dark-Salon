import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Brush,
} from "recharts";

export default function HistoryChart({ data }: any) {
  const chartData = data.daily.time.map((date: string, i: number) => ({
    date,
    max: data.daily.temperature_2m_max[i],
    min: data.daily.temperature_2m_min[i],
  }));

  return (
    <div style={{ overflowX: "auto" }}>
      <LineChart width={1000} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line dataKey="max" name="Max Temp" />
        <Line dataKey="min" name="Min Temp" />

        <Brush dataKey="date" height={30} stroke="#8884d8" />
      </LineChart>
    </div>
  );
}