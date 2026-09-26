import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { PageHeader } from "../../components/AppShell";
import { Pill } from "../../components/Pill";
import type { Application } from "../../types";

export function StudentsPage() {
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    api.get<Application[]>("/applications/university-students").then((res) => setApplications(res.data));
  }, []);

  return (
    <>
      <PageHeader title="Alumnos en proceso" subtitle="Alumnos de tu universidad vinculados con empresas asociadas" />
      <main className="view-area">
        <div className="view-section">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th>Carrera</th>
                  <th>Empresa</th>
                  <th>Puesto</th>
                  <th>Postulado</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr className="empty-row">
                    <td colSpan={6}>
                      Todavía no hay alumnos de tu universidad postulados a través de PraxisLink.
                    </td>
                  </tr>
                ) : (
                  applications.map((a) => (
                    <tr key={a.id}>
                      <td className="cell-primary">{a.student?.name}</td>
                      <td>{a.student?.career}</td>
                      <td>{a.offer?.company?.name}</td>
                      <td>{a.offer?.title}</td>
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
