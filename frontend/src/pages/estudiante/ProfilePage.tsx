import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { api, fileUrl } from "../../api/client";
import { PageHeader } from "../../components/AppShell";
import { useToast } from "../../components/Toast";
import type { StudentProfile } from "../../types";

const AVAILABILITY_OPTIONS = ["PPS / Part-time", "Full-time", "Solo remoto"];

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
}

export function EstudianteProfilePage() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [skillInput, setSkillInput] = useState("");
  const avatarInput = useRef<HTMLInputElement>(null);
  const cvInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<StudentProfile>("/students/me").then((res) => setProfile(res.data));
  }, []);

  async function patch(changes: Partial<StudentProfile>) {
    const { data } = await api.patch<StudentProfile>("/students/me", changes);
    setProfile(data);
    return data;
  }

  async function addSkill() {
    const value = skillInput.trim();
    if (!value || !profile) return;
    if (value.length > 40) {
      showToast("Esa habilidad es demasiado larga, probá resumirla.");
      return;
    }
    const alreadyExists = profile.skills.some((s) => s.toLowerCase() === value.toLowerCase());
    if (alreadyExists) {
      showToast("Esa habilidad ya está en tu lista.");
      setSkillInput("");
      return;
    }
    await patch({ skills: [...profile.skills, value] });
    setSkillInput("");
  }

  function handleSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  }

  async function removeSkill(index: number) {
    if (!profile) return;
    await patch({ skills: profile.skills.filter((_, i) => i !== index) });
  }

  async function handleAvatar(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await api.post<{ path: string }>("/uploads/avatar", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setProfile((p) => (p ? { ...p, avatarPath: data.path } : p));
    showToast("Foto de perfil actualizada.");
  }

  async function handleCv(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await api.post<{ path: string; originalName: string; cvKeywords: string[] }>(
      "/uploads/cv",
      fd,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    setProfile((p) => (p ? { ...p, cvPath: data.path, cvOriginalName: data.originalName, cvKeywords: data.cvKeywords } : p));
    showToast(
      data.cvKeywords.length > 0
        ? `CV cargado. Detectamos ${data.cvKeywords.length} palabra(s) clave para calcular tu compatibilidad.`
        : "CV cargado. No detectamos palabras clave conocidas: revisá que el PDF tenga texto seleccionable (no una imagen escaneada).",
    );
  }

  if (!profile) return null;

  return (
    <>
      <PageHeader title="Mi perfil" subtitle="Así te ven las empresas cuando te postulás" />
      <main className="view-area">
        <div className="view-section">
          <div className="profile-head">
            <span
              className="avatar big b"
              style={profile.avatarPath ? { backgroundImage: `url(${fileUrl(profile.avatarPath)})` } : undefined}
            >
              {!profile.avatarPath && initials(profile.name)}
            </span>
            <div>
              <h3>{profile.name}</h3>
              <p className="sub">
                {profile.career} · {profile.university}
              </p>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <input ref={avatarInput} type="file" accept=".jpg,.jpeg,.png,.webp" hidden onChange={handleAvatar} />
              <button className="btn btn-outline btn-sm" onClick={() => avatarInput.current?.click()}>
                Subir foto
              </button>
            </div>
          </div>

          <div className="form-grid">
            <div className="info-card">
              <span className="lbl">Universidad</span>
              {profile.university}
            </div>
            <div className="info-card">
              <span className="lbl">Carrera</span>
              {profile.career} {profile.year && `(${profile.year})`}
            </div>
            <div className="info-card">
              <span className="lbl">Ubicación</span>
              <input
                defaultValue={profile.location}
                onBlur={(e) => patch({ location: e.target.value })}
                style={{ border: "none", background: "transparent", padding: 0, fontSize: ".94rem", color: "var(--ink)", width: "100%" }}
              />
            </div>
            <div className="info-card">
              <span className="lbl">Disponibilidad</span>
              <select
                value={profile.availability}
                onChange={(e) => patch({ availability: e.target.value })}
                style={{ border: "1px solid var(--line)", borderRadius: 4, padding: "8px 10px", background: "var(--bg)", color: "var(--ink)", width: "100%" }}
              >
                {AVAILABILITY_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="info-card">
            <span className="lbl">Habilidades</span>
            <div className="tag-row">
              {profile.skills.map((skill, i) => (
                <span key={`${skill}-${i}`} className="tag">
                  {skill}
                  <button type="button" onClick={() => removeSkill(i)} aria-label="Quitar">
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="tag-add">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="Agregar habilidad y presionar Enter"
              />
              <button className="btn btn-outline btn-sm" type="button" onClick={addSkill}>
                Agregar
              </button>
            </div>
            <p style={{ fontSize: ".78rem", color: "var(--ink-faint)", marginTop: 10, marginBottom: 0 }}>
              Cuantas más habilidades reales cargues, mejor va a ser tu porcentaje de compatibilidad con cada oferta.
            </p>
          </div>

          <div className="info-card">
            <span className="lbl">Currículum (PDF)</span>
            <div className="file-row">
              <input ref={cvInput} type="file" accept=".pdf" hidden onChange={handleCv} />
              <button className="btn btn-outline btn-sm" onClick={() => cvInput.current?.click()}>
                Subir CV
              </button>
              {profile.cvPath ? (
                <>
                  <span className="fname">{profile.cvOriginalName}</span>
                  <a className="btn btn-outline btn-sm" href={fileUrl(profile.cvPath)} target="_blank" rel="noreferrer">
                    Ver CV
                  </a>
                </>
              ) : (
                <span className="fname">Todavía no subiste tu CV.</span>
              )}
            </div>
            {profile.cvPath && (
              <>
                <p style={{ fontSize: ".78rem", color: "var(--ink-faint)", marginTop: 14, marginBottom: 8 }}>
                  Palabras clave que detectamos en tu CV:
                </p>
                <div className="tag-row">
                  {profile.cvKeywords.length === 0 ? (
                    <span style={{ fontSize: ".82rem", color: "var(--ink-faint)" }}>
                      No detectamos términos conocidos en este PDF.
                    </span>
                  ) : (
                    profile.cvKeywords.map((k) => (
                      <span key={k} className="tag" style={{ color: "var(--teal)", borderColor: "var(--teal)" }}>
                        {k}
                      </span>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
