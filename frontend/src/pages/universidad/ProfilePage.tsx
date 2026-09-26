import { ChangeEvent, useEffect, useRef, useState } from "react";
import { api, fileUrl } from "../../api/client";
import { PageHeader } from "../../components/AppShell";
import { useToast } from "../../components/Toast";
import type { UniversityProfile } from "../../types";

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
}

export function UniversidadProfilePage() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<UniversityProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", description: "" });
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<UniversityProfile>("/universities/me").then((res) => {
      setProfile(res.data);
      setForm({ name: res.data.name, location: res.data.location, description: res.data.description });
    });
  }, []);

  async function save() {
    const { data } = await api.patch<UniversityProfile>("/universities/me", form);
    setProfile(data);
    setEditing(false);
    showToast("Perfil de universidad actualizado.");
  }

  async function handleLogo(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await api.post<{ path: string }>("/uploads/logo", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setProfile((p) => (p ? { ...p, logoPath: data.path } : p));
    showToast("Logo actualizado.");
  }

  if (!profile) return null;

  return (
    <>
      <PageHeader title="Perfil de universidad" subtitle="Información visible para empresas y estudiantes" />
      <main className="view-area">
        <div className="view-section">
          <div className="profile-head">
            <span
              className="avatar big c"
              style={profile.logoPath ? { backgroundImage: `url(${fileUrl(profile.logoPath)})` } : undefined}
            >
              {!profile.logoPath && initials(profile.name)}
            </span>
            <div>
              <h3>{profile.name}</h3>
              <p className="sub">{profile.location || "Sin ubicación definida"}</p>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
              <input ref={fileInput} type="file" accept=".jpg,.jpeg,.png,.webp" hidden onChange={handleLogo} />
              <button className="btn btn-outline btn-sm" onClick={() => fileInput.current?.click()}>
                Subir logo
              </button>
              {editing ? (
                <button className="btn btn-primary btn-sm" onClick={save}>
                  Guardar cambios
                </button>
              ) : (
                <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>
                  Editar perfil
                </button>
              )}
            </div>
          </div>

          {editing ? (
            <div className="table-wrap" style={{ padding: 24, boxShadow: "var(--shadow)" }}>
              <div className="form-grid">
                <div className="field">
                  <label>Nombre de la universidad</label>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Ubicación</label>
                  <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
                </div>
                <div className="field span-2">
                  <label>Descripción</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="info-card">
              <span className="lbl">Descripción</span>
              <p style={{ margin: 0 }}>{profile.description || "Todavía no agregaste una descripción."}</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
