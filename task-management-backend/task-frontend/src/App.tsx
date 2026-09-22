import { useState } from "react";

const API = "http://localhost:8000";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [title, setTitle] = useState("");

  const register = async () => {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    alert(data.message);
  };

  const login = async () => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.accessToken) {
      setToken(data.accessToken);
    } else {
      alert(data.message);
    }
  };

  const createTask = async () => {
    const res = await fetch(`${API}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description: "" }),
    });

    await res.json();
    setTitle("");
    getTasks();
  };

  const getTasks = async () => {
    const res = await fetch(`${API}/tasks`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setTasks(data);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🚀 Task Manager</h1>

        {!token ? (
          <>
            <input
              style={styles.input}
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              style={styles.input}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div style={styles.buttonRow}>
              <button style={styles.secondaryBtn} onClick={register}>
                Register
              </button>
              <button style={styles.primaryBtn} onClick={login}>
                Login
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={styles.taskInputRow}>
              <input
                style={styles.input}
                placeholder="Enter task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <button style={styles.primaryBtn} onClick={createTask}>
                Add
              </button>
            </div>

            <button style={styles.secondaryBtn} onClick={getTasks}>
              Load Tasks
            </button>

            <ul style={styles.taskList}>
              {tasks.map((task) => (
                <li key={task.id} style={styles.taskItem}>
                  {task.title}
                  <span>
                    {task.completed ? " ✅" : " ❌"}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    height: "100vh",
    background: "#0f172a",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial",
  },
  card: {
    background: "#1e293b",
    padding: 40,
    borderRadius: 12,
    width: 350,
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    color: "white",
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    border: "none",
    outline: "none",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "space-between",
  },
  taskInputRow: {
    display: "flex",
    gap: 10,
  },
  primaryBtn: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: 8,
    cursor: "pointer",
  },
  secondaryBtn: {
    background: "#334155",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: 8,
    cursor: "pointer",
  },
  taskList: {
    marginTop: 20,
    listStyle: "none",
    padding: 0,
  },
  taskItem: {
    background: "#334155",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    display: "flex",
    justifyContent: "space-between",
  },
};

export default App;
