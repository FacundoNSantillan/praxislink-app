import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { PageHeader } from "../../components/AppShell";
import { Pill } from "../../components/Pill";
import type { Application } from "../../types";

export function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    api.get<Application[]>("/applications/mine").then((res) => setApplications(res.data));
  }, []);

  return (
    <>
      <PageHeader title="Mis postulaciones" subtitle="Estado de tus postulaciones en curso" />
      <main className="view-area">
        <div className="view-section">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Oferta</th>
                  <th>Empresa</th>
                  <th>Match</th>
                  <th>Postulado</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr className="empty-row">
                    <td colSpan={5}>Todavía no te postulaste a ninguna oferta. Andá a "Buscar ofertas" para empezar.</td>
                  </tr>
                ) : (
                  applications.map((a) => (
                    <tr key={a.id}>
                      <td className="cell-primary">{a.offer?.title}</td>
                      <td>{a.offer?.company?.name}</td>
                      <td className="num">{a.matchScore}%</td>
                      <td>{new Date(a.createdAt).toLocaleDateString("es-AR")}</td>
                      <td>
                        <Pill status={a.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
