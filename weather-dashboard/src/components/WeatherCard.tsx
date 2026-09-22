type Props = {
  title: string;
  value: string;
};

export default function WeatherCard({ title, value }: Props) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "15px",
        borderRadius: "10px",
        width: "150px",
        textAlign: "center",
      }}
    >
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
}