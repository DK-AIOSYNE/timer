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
    font-family: "Orbitron", sans-serif; /* techno/luxury vibe */
    text-align: center;
    padding: 40px;
    background: linear-gradient(135deg, #000000 0%, #111111 100%);
    color: #eee;
    min-height: 100vh;
  }

  h1 {
    font-size: 3rem;
    color: #FFD700; /* gold */
    text-shadow: 0 0 10px #FFD700, 0 0 20px #FFA500;
    margin-bottom: 40px;
  }

  h2 {
    font-size: 1.8rem;
    color: #ccc;
    margin-bottom: 20px;
  }

  .participants {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
    margin-bottom: 50px;
  }

  .btn {
    padding: 16px 28px;
    border-radius: 12px;
    background: linear-gradient(145deg, #1a1a1a, #333333);
    color: #FFD700;
    font-weight: bold;
    font-size: 1.2rem;
    border: 2px solid #FFD700;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 0 10px #FFD70044, 0 0 20px #FFD70022;
  }

  .btn:hover {
    background: linear-gradient(145deg, #222222, #555555);
    box-shadow: 0 0 20px #FFD70088, 0 0 30px #FFA50044;
    transform: translateY(-2px) scale(1.05);
  }

  .btn.running {
    background: linear-gradient(145deg, #C0392B, #E74C3C);
    border-color: #FF8C00;
    box-shadow: 0 0 15px #FF8C00, 0 0 30px #FFD70066;
    color: #fff;
  }

  .leaderboard {
    margin: 0 auto;
    border-collapse: collapse;
    min-width: 400px;
    color: #eee;
    font-size: 1.1rem;
  }

  .leaderboard th, .leaderboard td {
    padding: 12px 20px;
    border-bottom: 1px solid #444;
    text-align: center;
  }

  .leaderboard tr.top {
    background: #222;
    color: #FFD700;
    font-weight: bold;
    box-shadow: 0 0 15px #FFD70055 inset;
  }

  /* subtle animation on top row */
  .leaderboard tr.top td {
    animation: glow 2s infinite alternate;
  }

  @keyframes glow {
    0% { text-shadow: 0 0 5px #FFD700, 0 0 10px #FFA500; }
    100% { text-shadow: 0 0 15px #FFD700, 0 0 25px #FFA500; }
  }
`}</style>

    </div>
  );
}
