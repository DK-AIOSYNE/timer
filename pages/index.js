// /pages/index.js
import { useEffect, useState } from "react";

const NAMES = ["Arno","Arthur","Charles","Orso","Martin","Antoine","Simon","Ferdinand"];

export default function Home() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [running, setRunning] = useState(null); // name of current runner
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  // Fetch leaderboard
  async function load() {
    const res = await fetch("/api/data");
    setLeaderboard(await res.json());
  }

  useEffect(() => { load(); const i = setInterval(load, 5000); return () => clearInterval(i); }, []);

  async function toggle(name) {
    if (running === name) {
      // Stop
      const seconds = Math.floor((Date.now() - startTime) / 1000);
      await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, seconds })
      });
      setRunning(null);
      setStartTime(null);
      setElapsed(0);
      load();
    } else {
      // Start new
      setRunning(name);
      setStartTime(Date.now());
    }
  }

  useEffect(() => {
    if (!running) return;
    const i = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 500);
    return () => clearInterval(i);
  }, [running, startTime]);

  function format(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  }

  return (
    <div style={{ fontFamily: "sans-serif", textAlign: "center", padding: 20 }}>
      <h1>⏱️ Focus Timer</h1>

      <h2>Participants</h2>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
        {NAMES.map(name => (
          <button
            key={name}
            onClick={() => toggle(name)}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              background: running === name ? "#e74c3c" : "#2ecc71",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            {running === name ? `Stop ${name} (${format(elapsed)})` : `Start ${name}`}
          </button>
        ))}
      </div>

      <h2 style={{ marginTop: 40 }}>Classement</h2>
      <table style={{ margin: "0 auto", borderCollapse: "collapse", minWidth: 300 }}>
        <thead>
          <tr><th>Nom</th><th>Temps total</th></tr>
        </thead>
        <tbody>
          {leaderboard.map((u, i) => (
            <tr key={u.name} style={{ background: i===0 ? "#ffd70066" : "transparent" }}>
              <td style={{ padding: "6px 12px" }}>{u.name}</td>
              <td style={{ padding: "6px 12px" }}>{format(u.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
