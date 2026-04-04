import { useEffect, useState } from "react";

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [amfi, setAmfi] = useState("");
  const [portfolio, setPortfolio] = useState<any[]>([]);

  // auto login
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(u);

    const saved = localStorage.getItem("portfolio");
    if (saved) setPortfolio(JSON.parse(saved));
  }, []);

  const handleLogin = () => {
    if (!username || !password) return alert("Enter details");
    localStorage.setItem("user", username);
    setUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  // save portfolio
  const savePortfolio = (data: any[]) => {
    setPortfolio(data);
    localStorage.setItem("portfolio", JSON.stringify(data));
  };

  // add fund
  const handleAddFund = async () => {
    if (!amfi) return alert("Enter AMFI");

    try {
      const res = await fetch(`https://api.mfapi.in/mf/${amfi}`);
      const data = await res.json();

      const newFund = {
        amfi,
        name: data.meta.scheme_name,
        nav: data.data[0].nav,
      };

      const updated = [...portfolio, newFund];
      savePortfolio(updated);
      setAmfi("");
    } catch {
      alert("Invalid AMFI");
    }
  };

  // remove fund
  const handleRemove = (index: number) => {
    const updated = portfolio.filter((_, i) => i !== index);
    savePortfolio(updated);
  };

  // refresh NAV
  const refreshNAV = async () => {
    const updated = await Promise.all(
      portfolio.map(async (f) => {
        try {
          const res = await fetch(`https://api.mfapi.in/mf/${f.amfi}`);
          const data = await res.json();

          return {
            ...f,
            nav: data.data[0].nav,
          };
        } catch {
          return f;
        }
      })
    );

    savePortfolio(updated);
  };

  // LOGIN UI
  if (!user) {
    return (
      <div className="container">
        <h2>Login</h2>
        <input onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
        <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  // MAIN UI
  return (
    <div className="container">
      <h2>Welcome {user}</h2>
      <button onClick={handleLogout}>Logout</button>

      <h3>Add Fund (AMFI)</h3>
      <input value={amfi} onChange={(e) => setAmfi(e.target.value)} placeholder="Enter AMFI" />
      <button onClick={handleAddFund}>Add Fund</button>

      <button onClick={refreshNAV}>Refresh NAV</button>

      <h3>Portfolio</h3>

      {portfolio.length === 0 && <p>No funds added</p>}

      {portfolio.map((f, i) => (
        <div key={i} className="card">
          <p><b>{f.name}</b></p>
          <p>NAV: ₹{f.nav}</p>
          <button onClick={() => handleRemove(i)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
