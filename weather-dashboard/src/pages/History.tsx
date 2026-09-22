import { useState } from "react";
import { getHistory } from "../services/api";
import HistoryChart from "../components/HistoryChart";

export default function History() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState<any>(null);

  const fetchData = async () => {
    const res = await getHistory(28.61, 77.23, startDate, endDate);
    setData(res);
  };

  return (
    <div>
      <h1>History Page 📅</h1>

      <input type="date" onChange={(e) => setStartDate(e.target.value)} />
      <input type="date" onChange={(e) => setEndDate(e.target.value)} />

      <button onClick={fetchData}>Get Data</button>

      {data && <HistoryChart data={data} />}
    </div>
  );
}