import { ChangeEvent, useEffect, useRef, useState } from "react";
import { api, fileUrl } from "../../api/client";
import { PageHeader } from "../../components/AppShell";
import { useToast } from "../../components/Toast";
import type { CompanyProfile } from "../../types";
import { isValidSite } from "../../utils/validation";

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
}

export function EmpresaProfilePage() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", rubro: "", site: "", size: "", description: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<CompanyProfile>("/companies/me").then((res) => {
      setProfile(res.data);
      setForm({
        name: res.data.name,
        rubro: res.data.rubro,
        site: res.data.site,
        size: res.data.size,
        description: res.data.description,
      });
    });
  }, []);

  async function save() {
    setFormError(null);
    if (!form.name.trim()) {
      setFormError("El nombre de la empresa no puede estar vacío.");
      return;
    }
    if (form.site.trim() && !isValidSite(form.site)) {
      setFormError("El sitio web no parece una dirección válida (ej: vantiasoftware.com.ar).");
      return;
    }
    const { data } = await api.patch<CompanyProfile>("/companies/me", {
      ...form,
      name: form.name.trim(),
      site: form.site.trim(),
    });
    setProfile(data);
    setEditing(false);
    showToast("Perfil de empresa actualizado.");
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
      <PageHeader title="Perfil de empresa" subtitle="Información visible para universidades y estudiantes" />
      <main className="view-area">
        <div className="view-section">
          <div className="profile-head">
            <span
              className="avatar big a"
              style={profile.logoPath ? { backgroundImage: `url(${fileUrl(profile.logoPath)})` } : undefined}
            >
              {!profile.logoPath && initials(profile.name)}
            </span>
            <div>
              <h3>{profile.name}</h3>
              <p className="sub">{profile.rubro || "Sin rubro definido"}</p>
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
              {formError && <div className="auth-error">{formError}</div>}
              <div className="form-grid">
                <div className="field">
                  <label>Nombre de la empresa</label>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Rubro</label>
                  <input value={form.rubro} onChange={(e) => setForm((f) => ({ ...f, rubro: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Sitio web</label>
                  <input value={form.site} onChange={(e) => setForm((f) => ({ ...f, site: e.target.value }))} placeholder="vantiasoftware.com.ar" />
                </div>
                <div className="field">
                  <label>Tamaño</label>
                  <input value={form.size} onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))} />
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
            <>
              <div className="info-card">
                <span className="lbl">Sitio web</span>
                {profile.site || "—"}
              </div>
              <div className="info-card">
                <span className="lbl">Tamaño</span>
                {profile.size || "—"}
              </div>
              <div className="info-card">
                <span className="lbl">Descripción</span>
                <p style={{ margin: 0 }}>{profile.description || "Todavía no agregaste una descripción."}</p>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
