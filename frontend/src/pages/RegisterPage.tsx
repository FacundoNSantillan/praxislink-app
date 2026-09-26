import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { api, apiErrorMessage } from "../api/client";
import type { UserRole } from "../types";

const OTHER_UNIVERSITY = "__otra__";

interface UniversityOption {
  id: string;
  name: string;
  location: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  empresa: "Empresa",
  estudiante: "Estudiante",
  universidad: "Universidad",
};

export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>("estudiante");
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    rubro: "",
    university: "",
    career: "",
    location: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [universities, setUniversities] = useState<UniversityOption[]>([]);
  const [universitySelect, setUniversitySelect] = useState<string>("");

  useEffect(() => {
    api.get<UniversityOption[]>("/public/universities").then((res) => setUniversities(res.data));
  }, []);

  if (user) return <Navigate to={`/${user.role}`} replace />;

  function selectUniversity(value: string) {
    setUniversitySelect(value);
    if (value !== OTHER_UNIVERSITY) update("university", value);
    else update("university", "");
  }

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        role,
        name: form.name,
        rubro: role === "empresa" ? form.rubro : undefined,
        university: role === "estudiante" ? form.university : undefined,
        career: role === "estudiante" ? form.career : undefined,
        location: role === "universidad" ? form.location : undefined,
      });
      navigate("/", { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, "No pudimos crear tu cuenta."));
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
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: 6 }}>Creá tu cuenta</h1>
        <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem", marginBottom: 20 }}>
          Elegí con qué perfil querés usar PraxisLink.
        </p>

        <div className="role-tabs">
          {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
            <button
              key={r}
              type="button"
              className={`role-tab${role === r ? " active" : ""}`}
              onClick={() => setRole(r)}
            >
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">{role === "empresa" ? "Nombre de la empresa" : role === "universidad" ? "Nombre de la universidad" : "Nombre y apellido"}</label>
            <input id="name" required value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>

          {role === "empresa" && (
            <div className="field">
              <label htmlFor="rubro">Rubro</label>
              <input id="rubro" value={form.rubro} onChange={(e) => update("rubro", e.target.value)} placeholder="Desarrollo de software" />
            </div>
          )}

          {role === "estudiante" && (
            <>
              <div className="field">
                <label htmlFor="university">Universidad</label>
                {universities.length > 0 ? (
                  <select id="university" required value={universitySelect} onChange={(e) => selectUniversity(e.target.value)}>
                    <option value="" disabled>
                      Seleccioná tu universidad
                    </option>
                    {universities.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                    <option value={OTHER_UNIVERSITY}>Otra (no está en la lista)</option>
                  </select>
                ) : (
                  <input required value={form.university} onChange={(e) => update("university", e.target.value)} placeholder="UTN Facultad Regional Tucumán" />
                )}
                {universitySelect === OTHER_UNIVERSITY && (
                  <input
                    style={{ marginTop: 8 }}
                    required
                    value={form.university}
                    onChange={(e) => update("university", e.target.value)}
                    placeholder="Escribí el nombre de tu universidad"
                  />
                )}
                <p style={{ fontSize: ".76rem", color: "var(--ink-faint)", margin: "4px 0 0" }}>
                  Elegir tu universidad de la lista permite que vea tu proceso de postulación.
                </p>
              </div>
              <div className="field">
                <label htmlFor="career">Carrera</label>
                <input id="career" value={form.career} onChange={(e) => update("career", e.target.value)} placeholder="Ingeniería en Sistemas de Información" />
              </div>
            </>
          )}

          {role === "universidad" && (
            <div className="field">
              <label htmlFor="location">Ubicación</label>
              <input id="location" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="San Miguel de Tucumán" />
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>
        <p className="auth-switch">
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  );
}
