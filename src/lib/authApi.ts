const API = import.meta.env.VITE_API_URL;

export async function apiRegister(data: { name: string; email: string; password: string }) {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json as { token: string; user: any };
}

export async function apiLogin(data: { email: string; password: string }) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json as { token: string; user: any };
}
