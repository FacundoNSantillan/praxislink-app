import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { apiErrorMessage } from "../api/client";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={`/${user.role}`} replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, "Email o contraseña incorrectos."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <svg viewBox="0 0 26 26" fill="none" width="22" height="22">
            <circle cx="6" cy="13" r="3.4" stroke="var(--accent)" strokeWidth="1.6" />
            <circle cx="20" cy="6" r="3.4" stroke="var(--teal)" strokeWidth="1.6" />
            <circle cx="20" cy="20" r="3.4" stroke="var(--teal)" strokeWidth="1.6" />
            <line x1="9" y1="12" x2="17" y2="7.4" stroke="var(--ink)" strokeWidth="1.2" />
            <line x1="9" y1="14" x2="17" y2="18.6" stroke="var(--ink)" strokeWidth="1.2" />
          </svg>
          PraxisLink
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: 6 }}>Iniciá sesión</h1>
        <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem", marginBottom: 22 }}>
          Empresas, estudiantes y universidades entran desde la misma pantalla.
        </p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
        <p className="auth-switch">
          ¿No tenés cuenta? <Link to="/register">Creá una acá</Link>
        </p>
      </div>
    </div>
  );
}
