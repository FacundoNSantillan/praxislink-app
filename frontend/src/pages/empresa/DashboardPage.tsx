import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { PageHeader } from "../../components/AppShell";
import { Pill } from "../../components/Pill";
import type { Application, Offer } from "../../types";
import { useAuth } from "../../auth/AuthContext";

export function EmpresaDashboardPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get<Offer[]>("/offers/mine"), api.get<Application[]>("/applications/company")])
      .then(([offersRes, appsRes]) => {
        setOffers(offersRes.data);
        setApplications(appsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeOffers = offers.filter((o) => o.status === "Activa");
  const newApplicants = applications.filter((a) => a.status === "Nuevo").length;
  const inInterview = applications.filter((a) => a.status === "Entrevista").length;
  const maxApps = Math.max(1, ...activeOffers.map((o) => applications.filter((a) => a.offerId === o.id).length));

  return (
    <>
      <PageHeader
        title="Panel"
        subtitle="Resumen de tus búsquedas activas y postulantes"
        right={
          <>
            <span className="avatar a">{user?.email.slice(0, 2).toUpperCase()}</span>
          </>
        }
      />
      <main className="view-area">
        {loading ? (
          <p style={{ color: "var(--ink-faint)" }}>Cargando…</p>
        ) : (
          <>
            <div className="view-section">
              <div className="stat-grid">
                <div className="stat-card">
                  <span className="lbl">Ofertas activas</span>
                  <span className="num">{activeOffers.length}</span>
                </div>
                <div className="stat-card">
                  <span className="lbl">Postulantes nuevos</span>
                  <span className="num">{newApplicants}</span>
                </div>
                <div className="stat-card">
                  <span className="lbl">En proceso de entrevista</span>
                  <span className="num">{inInterview}</span>
                </div>
                <div className="stat-card">
                  <span className="lbl">Total de postulantes</span>
                  <span className="num">{applications.length}</span>
                </div>
              </div>
            </div>

            <div className="view-section">
              <div className="view-section-head">
                <h3>Postulantes por oferta</h3>
              </div>
              <div className="table-wrap" style={{ padding: "20px 22px" }}>
                {activeOffers.length === 0 ? (
                  <p style={{ color: "var(--ink-faint)", fontSize: ".86rem", margin: 0 }}>
                    Todavía no tenés ofertas activas.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {activeOffers.map((o) => {
                      const count = applications.filter((a) => a.offerId === o.id).length;
                      const pct = Math.round((count / maxApps) * 100);
                      return (
                        <div key={o.id} style={{ display: "grid", gridTemplateColumns: "180px 1fr 44px", alignItems: "center", gap: 12 }}>
                          <span style={{ fontSize: ".86rem", color: "var(--ink-soft)" }}>{o.title}</span>
                          <span className="bar-track">
                            <span className="bar-fill" style={{ width: `${pct}%` }} />
                          </span>
                          <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: ".8rem", textAlign: "right", color: "var(--ink-soft)" }}>
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="view-section">
              <div className="view-section-head">
                <h3>Últimas ofertas publicadas</h3>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Puesto</th>
                      <th>Tipo</th>
                      <th>Modalidad</th>
                      <th>Postulantes</th>
                      <th>Estado</th>
                      <th>Publicada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.length === 0 ? (
                      <tr className="empty-row">
                        <td colSpan={6}>Todavía no publicaste ninguna oferta.</td>
                      </tr>
                    ) : (
                      offers.slice(0, 6).map((o) => (
                        <tr key={o.id}>
                          <td className="cell-primary">
                            {o.title}
                            <span className="cell-sub">{o.area}</span>
                          </td>
                          <td>{o.type}</td>
                          <td>{o.modality}</td>
                          <td className="num">{applications.filter((a) => a.offerId === o.id).length}</td>
                          <td>
                            <Pill status={o.status} />
                          </td>
                          <td>{new Date(o.createdAt).toLocaleDateString("es-AR")}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
