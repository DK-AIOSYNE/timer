// pages/api/data.js
let users = [
  { name: "Arno", total: 0 },
  { name: "Arthur", total: 0 },
  { name: "Charles", total: 0 },
  { name: "Orso", total: 0 },
  { name: "Martin", total: 0 },
  { name: "Antoine", total: 0 },
  { name: "Simon", total: 0 },
  { name: "Ferdinand", total: 0 },
];

export default function handler(req, res) {
  if (req.method === "GET") {
    // return leaderboard sorted desc
    const sorted = users.slice().sort((a,b)=> b.total - a.total);
    return res.status(200).json(sorted);
  }

  if (req.method === "POST") {
    const { name, seconds } = req.body;
    if (!name || typeof seconds !== "number") {
      return res.status(400).json({ error: "Invalid payload" });
    }
    const user = users.find(u => u.name === name);
    if (user) {
      user.total += seconds;
    } else {
      // optionally add new
      users.push({ name, total: seconds });
    }
    const sorted = users.slice().sort((a,b)=> b.total - a.total);
    return res.status(200).json(sorted);
  }

  res.status(405).end();
}
