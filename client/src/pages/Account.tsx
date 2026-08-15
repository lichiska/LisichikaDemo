import { FormEvent, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, LockKeyhole, LogOut, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth, authRequest } from "../_core/hooks/useAuth";

export default function Account() {
  const { user, loading, logout, refresh } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await authRequest(`/api/auth/${mode}`, { method: "POST", body: JSON.stringify({ username, password }) });
      await refresh();
      setPassword("");
      toast.success(mode === "login" ? "Welcome back to the studio." : "Account created. Your studio is ready.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The account request failed.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    try {
      await logout();
      toast.success("Signed out securely.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign out failed.");
    }
  }

  return <main className="account-shell"><Link href="/" className="account-back"><ArrowLeft size={16} /> Back to signal</Link><div className="account-card"><div className="account-mark">FC</div><p className="eyebrow">FOXY CODENAME / ACCOUNT</p>{loading ? <p className="account-status">Reading session…</p> : user ? <><h1>Welcome, <i>{user.username}</i>.</h1><p className="account-copy">Your saved Studio projects and production settings are attached to this account.</p><div className="account-actions"><Link href="/studio" className="button button-coral">Open Studio</Link><button className="button button-outline" onClick={signOut}><LogOut size={15} /> Sign out</button></div></> : <><h1>{mode === "login" ? <>Enter the<br /><i>signal.</i></> : <>Create your<br /><i>workspace.</i></>}</h1><p className="account-copy">Use only a username and password. Passwords are hashed before they reach the database and sessions are stored server-side.</p><form className="account-form" onSubmit={submit}><label><UserRound size={15} /> Username<input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} minLength={3} maxLength={32} pattern="[A-Za-z0-9_.-]+" required /></label><label><LockKeyhole size={15} /> Password<input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={10} required /></label><button className="button button-coral" disabled={busy}>{busy ? "Connecting…" : mode === "login" ? "Sign in" : "Create account"}</button></form><button className="account-switch" onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "Need an account? Create one" : "Already registered? Sign in"}</button></>}</div></main>;
}
