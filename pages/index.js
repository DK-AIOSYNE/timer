// /pages/index.js
import { useEffect, useState } from "react";

const NAMES = ["Arno","Arthur","Charles","Orso","Martin","Antoine","Simon","Ferdinand"];

export default function Home() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [running, setRunning] = useState(null); // current runner
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [active, setActive] = useState(true); // whether tab is active

  // Fetch leaderboard
  async function load() {
    const res = await fetch("/api/data");
    setLeaderboard(await res.json());
  }

  useEffect(() => { 
    load(); 
    const i = setInterval(load, 5000); 
    return () => clearInterval(i); 
  }, []);

  async function toggle(name) {
    if (running === name) {
      stopTimer(name);
    } else {
      setRunning(name);
      setStartTime(Date.now());
      setElapsed(0);
    }
  }

  async function stopTimer(name) {
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
  }

  // Update elapsed time
  useEffect(() => {
    if (!running || !active) return;

    const i = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 500);

    return () => clearInterval(i);
  }, [running, startTime, active]);

  // Stop timer if tab inactive or user closes page
  useEffect(() => {
    function handleVisibility() {
      setActive(!document.hidden);
      if (document.hidden && running) stopTimer(running);
    }

    function handleBeforeUnload() {
      if (running) stopTimer(running);
    }

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [running, startTime]);

  function format(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2,"0")}`;
  }

  return (
    <div className="container">
      <h1>⏱️ Focus Timer</h1>

      <h2>Participants</h2>
      <div className="participants">
        {NAMES.map(name => (
          <button
            key={name}
            onClick={() => toggle(name)}
            className={running === name ? "btn running" : "btn"}
          >
            {running === name ? `${name} (${format(elapsed)})` : name}
          </button>
        ))}
      </div>

      <h2>Classement</h2>
      <table className="leaderboard">
        <thead>
          <tr><th>Nom</th><th>Temps total</th></tr>
        </thead>
        <tbody>
          {leaderboard.map((u, i) => (
            <tr key={u.name} className={i===0 ? "top" : ""}>
              <td>{u.name}</td>
              <td>{format(u.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx>{`
        .container {
          font-family: "Segoe UI", sans-serif;
          text-align: center;
          padding: 20px;
          background: #000;
          color: #ccc;
          min-height: 100vh;
        }

        h1, h2 { color: #eee; }

        .participants {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
          margin-bottom: 40px;
        }

        .btn {
          padding: 12px 20px;
          border-radius: 8px;
          background: #333;
          color: #eee;
          border: 2px solid #555;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s;
        }

        .btn:hover { background: #555; }

        .btn.running {
          background: #e74c3c;
          border-color: #c0392b;
        }

        .leaderboard {
          margin: 0 auto;
          border-collapse: collapse;
          min-width: 300px;
          color: #eee;
        }

        .leaderboard th, .leaderboard td {
          padding: 8px 12px;
          border-bottom: 1px solid #444;
        }

        .leaderboard tr.top {
          background: #444;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
