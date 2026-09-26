import { FormEvent, useEffect, useState } from "react";
import { api, apiErrorMessage } from "../../api/client";
import { PageHeader } from "../../components/AppShell";
import { Pill } from "../../components/Pill";
import { useToast } from "../../components/Toast";
import type { Agreement } from "../../types";

interface CompanyOption {
  id: string;
  name: string;
  rubro: string;
}

export function AgreementsPage() {
  const { showToast } = useToast();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [type, setType] = useState("Convenio marco");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    api.get<Agreement[]>("/agreements/mine").then((res) => setAgreements(res.data));
  }

  useEffect(load, []);
  useEffect(() => {
    api.get<CompanyOption[]>("/companies").then((res) => {
      setCompanies(res.data);
      if (res.data[0]) setCompanyId(res.data[0].id);
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!companyId) {
      setError("Todavía no hay empresas registradas en la plataforma.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/agreements", { companyId, type });
      load();
      showToast("Convenio creado. Queda pendiente de firma.");
    } catch (err) {
      setError(apiErrorMessage(err, "No pudimos crear el convenio."));
    } finally {
      setSubmitting(false);
    }
  }

  async function markSigned(id: string) {
    await api.patch(`/agreements/${id}/sign`);
    load();
    showToast("Convenio marcado como vigente.");
  }

  const vigentes = agreements.filter((a) => a.status === "Vigente").length;
  const pendientes = agreements.filter((a) => a.status === "Pendiente firma").length;

  return (
    <>
      <PageHeader title="Panel de convenios" subtitle="Convenios con empresas para tus alumnos" />
      <main className="view-area">
        <div className="view-section">
          <div className="stat-grid">
            <div className="stat-card">
              <span className="lbl">Convenios vigentes</span>
              <span className="num">{vigentes}</span>
            </div>
            <div className="stat-card">
              <span className="lbl">Pendientes de firma</span>
              <span className="num">{pendientes}</span>
            </div>
            <div className="stat-card">
              <span className="lbl">Total de convenios</span>
              <span className="num">{agreements.length}</span>
            </div>
          </div>
        </div>

        <div className="view-section">
          <div className="view-section-head">
            <h3>Nuevo convenio</h3>
          </div>
          <div className="table-wrap" style={{ padding: 24, boxShadow: "var(--shadow)" }}>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="field">
                  <label>Empresa</label>
                  <select value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Tipo de convenio</label>
                  <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option>Convenio marco</option>
                    <option>Convenio PPS</option>
                    <option>Convenio pasantías</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? "Creando…" : "Crear convenio"}
              </button>
            </form>
          </div>
        </div>

        <div className="view-section">
          <div className="view-section-head">
            <h3>Convenios con empresas</h3>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Tipo de convenio</th>
                  <th>Firmado</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {agreements.length === 0 ? (
                  <tr className="empty-row">
                    <td colSpan={5}>Todavía no creaste ningún convenio.</td>
                  </tr>
                ) : (
                  agreements.map((a) => (
                    <tr key={a.id}>
                      <td className="cell-primary">{a.company?.name}</td>
                      <td>{a.type}</td>
                      <td>{new Date(a.signedAt).toLocaleDateString("es-AR")}</td>
                      <td>
                        <Pill status={a.status} />
                      </td>
                      <td>
                        {a.status === "Pendiente firma" && (
                          <button className="btn btn-outline btn-sm" onClick={() => markSigned(a.id)}>
                            Marcar como firmado
                          </button>
                        )}
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
