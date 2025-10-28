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
      <h1>FOCUS</h1>

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
    font-family: "Orbitron", sans-serif;
    text-align: center;
    padding: 40px 20px;
    background-color: #000;
    color: #ccc;
    min-height: 100vh;
  }

  h1 {
    font-size: 2.5rem;
    color: #fff;
    letter-spacing: 1px;
    margin-bottom: 30px;
  }

  h2 {
    font-size: 1.5rem;
    color: #888;
    margin-bottom: 15px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .participants {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
    margin-bottom: 40px;
  }

  .btn {
    padding: 14px 20px;
    border-radius: 8px;
    background-color: #111;
    color: #eee;
    font-weight: bold;
    font-size: 1rem;
    border: 2px solid #444;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    flex: 1 1 40%; /* responsive buttons */
    max-width: 200px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .btn:hover {
    background-color: #222;
    border-color: #666;
    transform: scale(1.05);
  }

  .btn.running {
    background-color: #C00;
    border-color: #900;
    color: #fff;
    box-shadow: 0 0 8px #C00;
  }

  .leaderboard {
    margin: 0 auto;
    border-collapse: collapse;
    width: 100%;
    max-width: 400px;
    color: #ccc;
    font-size: 1rem;
  }

  .leaderboard th, .leaderboard td {
    padding: 10px 12px;
    border-bottom: 1px solid #222;
    text-align: center;
  }

  .leaderboard tr.top {
    background-color: #000;
    color: #fff;
    font-weight: bold;
  }

  /* === MEDIA QUERIES POUR MOBILE === */
  @media (max-width: 768px) {
    h1 {
      font-size: 2rem;
    }
    h2 {
      font-size: 1.2rem;
    }
    .btn {
      flex: 1 1 80%; /* les boutons prennent plus de place */
      font-size: 0.95rem;
      padding: 12px 16px;
    }
    .leaderboard {
      font-size: 0.9rem;
    }
    .leaderboard th, .leaderboard td {
      padding: 8px 10px;
    }
  }

  @media (max-width: 480px) {
    h1 {
      font-size: 1.8rem;
    }
    h2 {
      font-size: 1rem;
    }
    .btn {
      flex: 1 1 100%;
      font-size: 0.9rem;
      padding: 10px 12px;
    }
    .leaderboard {
      max-width: 100%;
    }
  }
`}</style>


    </div>
  );
}
