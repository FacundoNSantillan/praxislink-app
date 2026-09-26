import { useEffect, useMemo, useState } from "react";
import { api, fileUrl } from "../../api/client";
import { PageHeader } from "../../components/AppShell";
import { statusClass } from "../../components/Pill";
import type { Application, Offer } from "../../types";

const STATUSES = ["Nuevo", "En revisión", "Entrevista", "Contratado", "Rechazado"] as const;

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function CandidatesPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offerFilter, setOfferFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    Promise.all([api.get<Application[]>("/applications/company"), api.get<Offer[]>("/offers/mine")]).then(
      ([appsRes, offersRes]) => {
        setApplications(appsRes.data);
        setOffers(offersRes.data);
        setLoading(false);
      },
    );
  }

  useEffect(load, []);

  const filtered = useMemo(() => {
    return applications
      .filter((a) => (offerFilter ? a.offerId === offerFilter : true))
      .filter((a) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          a.student?.name.toLowerCase().includes(q) || a.student?.university.toLowerCase().includes(q)
        );
      });
  }, [applications, offerFilter, search]);

  async function updateStatus(id: string, status: string) {
    await api.patch(`/applications/${id}/status`, { status });
    setApplications((apps) => apps.map((a) => (a.id === id ? { ...a, status: status as Application["status"] } : a)));
  }

  return (
    <>
      <PageHeader title="Postulantes" subtitle="Seguimiento de candidatos por oferta" />
      <main className="view-area">
        <div className="view-section">
          <div className="filter-bar">
            <select value={offerFilter} onChange={(e) => setOfferFilter(e.target.value)}>
              <option value="">Todas las ofertas</option>
              {offers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </select>
            <input
              type="search"
              placeholder="Buscar por nombre o universidad…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Postulante</th>
                  <th>Oferta</th>
                  <th>Universidad / carrera</th>
                  <th>Match</th>
                  <th>Postulado</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {!loading && filtered.length === 0 && (
                  <tr className="empty-row">
                    <td colSpan={7}>No hay postulantes para este filtro todavía.</td>
                  </tr>
                )}
                {filtered.map((a) => {
                  const offer = offers.find((o) => o.id === a.offerId);
                  return (
                    <tr key={a.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span className="avatar a">{a.student ? initials(a.student.name) : "—"}</span>
                          <span className="cell-primary">{a.student?.name}</span>
                        </div>
                      </td>
                      <td>{offer?.title || "—"}</td>
                      <td>
                        {a.student?.university}
                        <span className="cell-sub">{a.student?.career}</span>
                      </td>
                      <td>
                        <div className="progress-cell">
                          <span className="bar-track">
                            <span className="bar-fill" style={{ width: `${a.matchScore}%` }} />
                          </span>
                          <span className="pct">{a.matchScore}%</span>
                        </div>
                      </td>
                      <td>{new Date(a.createdAt).toLocaleDateString("es-AR")}</td>
                      <td>
                        <select
                          className={`status-select ${statusClass(a.status)}`}
                          value={a.status}
                          onChange={(e) => updateStatus(a.id, e.target.value)}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={() => setSelected(a)}>
                          Ver perfil
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={() => setSelected(null)} aria-label="Cerrar">
              &times;
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <span className="avatar big a">{selected.student ? initials(selected.student.name) : "—"}</span>
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 600 }}>{selected.student?.name}</h3>
                <p style={{ fontSize: ".82rem", color: "var(--ink-soft)", margin: 0 }}>
                  {selected.student?.university} · {selected.student?.career}
                </p>
              </div>
            </div>
            <div className="info-card">
              <span className="lbl">Match con el puesto</span>
              <span className={`pill ${selected.matchScore >= 80 ? "ok" : selected.matchScore >= 60 ? "review" : "crit"}`}>
                {selected.matchScore}% de coincidencia
              </span>
            </div>
            <div className="info-card">
              <span className="lbl">Habilidades</span>
              <div className="tag-row">
                {(selected.student?.skills || []).map((s) => (
                  <span key={s} className="tag">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            {selected.matchedKeywords.length > 0 && (
              <div className="info-card">
                <span className="lbl">Por qué coincide (palabras de su CV / perfil que están en tu oferta)</span>
                <div className="tag-row">
                  {selected.matchedKeywords.map((k) => (
                    <span key={k} className="tag" style={{ color: "var(--teal)", borderColor: "var(--teal)" }}>
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="info-card">
              <span className="lbl">Mensaje de postulación</span>
              <p style={{ margin: 0, fontSize: ".88rem" }}>{selected.message || "Sin mensaje."}</p>
            </div>
            {selected.student?.cvPath && (
              <a className="btn btn-outline btn-block" href={fileUrl(selected.student.cvPath)} target="_blank" rel="noreferrer">
                Ver CV (PDF)
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
