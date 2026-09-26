import { FormEvent, useEffect, useState } from "react";
import { api, apiErrorMessage } from "../../api/client";
import { PageHeader } from "../../components/AppShell";
import { Pill } from "../../components/Pill";
import { useToast } from "../../components/Toast";
import type { Offer } from "../../types";

const AREAS = ["Sistemas y Producto", "Comercial y Marketing", "Talent & Placement", "Administración y Legal", "Operaciones"];
const TYPES = ["PPS", "Pasantía", "Primer empleo"];
const MODALITIES = ["Híbrida", "Presencial", "Remota"];

const EMPTY_FORM = {
  title: "",
  area: AREAS[0],
  type: TYPES[0],
  modality: MODALITIES[0],
  location: "",
  vacancies: 1,
  description: "",
  requirements: "",
};

export function PublishOfferPage() {
  const { showToast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function loadOffers() {
    api.get<Offer[]>("/offers/mine").then((res) => setOffers(res.data));
  }

  useEffect(loadOffers, []);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/offers", form);
      setForm(EMPTY_FORM);
      loadOffers();
      showToast("Oferta publicada: ya está visible en la búsqueda de estudiantes.");
    } catch (err) {
      setError(apiErrorMessage(err, "No pudimos publicar la oferta."));
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(offer: Offer) {
    const nextStatus = offer.status === "Activa" ? "Cerrada" : "Activa";
    try {
      await api.patch(`/offers/${offer.id}/status`, { status: nextStatus });
      loadOffers();
      showToast(nextStatus === "Activa" ? "Oferta reabierta." : "Oferta cerrada.");
    } catch (err) {
      showToast(apiErrorMessage(err, "No pudimos actualizar la oferta."));
    }
  }

  return (
    <>
      <PageHeader title="Publicar oferta" subtitle="Cargá una nueva búsqueda para tu empresa" />
      <main className="view-area">
        <div className="view-section">
          <div className="table-wrap" style={{ boxShadow: "var(--shadow)", padding: "26px 28px" }}>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="field span-2">
                  <label htmlFor="title">Título del puesto</label>
                  <input id="title" required value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Ej: Analista de Sistemas Jr." />
                </div>
                <div className="field">
                  <label htmlFor="area">Área</label>
                  <select id="area" value={form.area} onChange={(e) => update("area", e.target.value)}>
                    {AREAS.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="type">Tipo</label>
                  <select id="type" value={form.type} onChange={(e) => update("type", e.target.value)}>
                    {TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="modality">Modalidad</label>
                  <select id="modality" value={form.modality} onChange={(e) => update("modality", e.target.value)}>
                    {MODALITIES.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="location">Ubicación</label>
                  <input id="location" required value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="San Miguel de Tucumán" />
                </div>
                <div className="field span-2">
                  <label htmlFor="vacancies">Vacantes</label>
                  <input
                    id="vacancies"
                    type="number"
                    min={1}
                    required
                    value={form.vacancies}
                    onChange={(e) => update("vacancies", Number(e.target.value))}
                  />
                </div>
                <div className="field span-2">
                  <label htmlFor="description">Descripción</label>
                  <textarea
                    id="description"
                    required
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="Contá de qué se trata el puesto y qué va a hacer la persona seleccionada."
                  />
                </div>
                <div className="field span-2">
                  <label htmlFor="requirements">Requisitos</label>
                  <textarea
                    id="requirements"
                    required
                    value={form.requirements}
                    onChange={(e) => update("requirements", e.target.value)}
                    placeholder="Ej: 3er año en adelante de Ingeniería en Sistemas, conocimientos de SQL."
                  />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22 }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Publicando…" : "Publicar oferta"}
                </button>
                <span style={{ fontSize: ".8rem", color: "var(--ink-faint)" }}>
                  Se va a mostrar en la búsqueda de estudiantes al instante.
                </span>
              </div>
            </form>
          </div>
        </div>

        <div className="view-section">
          <div className="view-section-head">
            <h3>Tus ofertas publicadas</h3>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Puesto</th>
                  <th>Tipo</th>
                  <th>Modalidad</th>
                  <th>Estado</th>
                  <th>Publicada</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {offers.length === 0 ? (
                  <tr className="empty-row">
                    <td colSpan={6}>Todavía no publicaste ninguna oferta.</td>
                  </tr>
                ) : (
                  offers.map((o) => (
                    <tr key={o.id}>
                      <td className="cell-primary">
                        {o.title}
                        <span className="cell-sub">{o.area}</span>
                      </td>
                      <td>{o.type}</td>
                      <td>{o.modality}</td>
                      <td>
                        <Pill status={o.status} />
                      </td>
                      <td>{new Date(o.createdAt).toLocaleDateString("es-AR")}</td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={() => toggleStatus(o)}>
                          {o.status === "Activa" ? "Cerrar" : "Reabrir"}
                        </button>
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
