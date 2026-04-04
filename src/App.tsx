import { useEffect, useState } from "react";

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [amfi, setAmfi] = useState("");
  const [fund, setFund] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(u);
  }, []);

  const handleLogin = () => {
    if (!username || !password) {
      alert("Enter details");
      return;
    }
    localStorage.setItem("user", username);
    setUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const fetchNAV = async () => {
    try {
      const res = await fetch(`https://api.mfapi.in/mf/${amfi}`);
      const data = await res.json();

      setFund({
        name: data.meta.scheme_name,
        nav: data.data[0].nav,
        date: data.data[0].date
      });
    } catch {
      alert("Invalid AMFI");
    }
  };

  if (!user) {
    return (
      <div className="container">
        <h2>Login</h2>
        <input
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Welcome {user}</h2>
      <button onClick={handleLogout}>Logout</button>

      <h3>Enter AMFI Code</h3>
      <input
        placeholder="e.g. 119551"
        value={amfi}
        onChange={(e) => setAmfi(e.target.value)}
      />
      <button onClick={fetchNAV}>Fetch NAV</button>

      {fund && (
        <div className="card">
          <p><b>{fund.name}</b></p>
          <p>NAV: ₹{fund.nav}</p>
          <p>Date: {fund.date}</p>
        </div>
      )}
    </div>
  );
}
