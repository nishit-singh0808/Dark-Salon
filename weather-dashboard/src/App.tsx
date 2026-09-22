import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import History from "./pages/History";

function App() {
  return (
    <div>
      <nav style={{ display: "flex", gap: "20px" }}>
        <Link to="/">Home</Link>
        <Link to="/history">History</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </div>
  );
}

export default App;