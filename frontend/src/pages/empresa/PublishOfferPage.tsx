import { FormEvent, useEffect, useState } from "react";
import { api, apiErrorMessage } from "../../api/client";
import { PageHeader } from "../../components/AppShell";
import { Pill } from "../../components/Pill";
import { useToast } from "../../components/Toast";
import type { Offer } from "../../types";
import { hasErrors, minLength, required, type FieldErrors } from "../../utils/validation";

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function loadOffers() {
    api.get<Offer[]>("/offers/mine").then((res) => setOffers(res.data));
  }

  useEffect(loadOffers, []);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    const titleError = required(form.title, "Ingresá el título del puesto.");
    if (titleError) errors.title = titleError;
    else if (!minLength(form.title, 4)) errors.title = "Usá un título un poco más descriptivo (mínimo 4 caracteres).";

    const locationError = required(form.location, "Ingresá la ubicación.");
    if (locationError) errors.location = locationError;

    if (!Number.isInteger(form.vacancies) || form.vacancies < 1) {
      errors.vacancies = "Tiene que ser un número entero de 1 o más.";
    }

    const descriptionError = required(form.description, "Contá de qué se trata el puesto.");
    if (descriptionError) errors.description = descriptionError;
    else if (!minLength(form.description, 20)) errors.description = "Agregá un poco más de detalle (mínimo 20 caracteres).";

    const requirementsError = required(form.requirements, "Contá qué requisitos pedís.");
    if (requirementsError) errors.requirements = requirementsError;
    else if (!minLength(form.requirements, 10)) errors.requirements = "Agregá un poco más de detalle (mínimo 10 caracteres).";

    return errors;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const errors = validate();
    setFieldErrors(errors);
    if (hasErrors(errors)) return;

    setSubmitting(true);
    try {
      await api.post("/offers", { ...form, title: form.title.trim(), location: form.location.trim() });
      setForm(EMPTY_FORM);
      setFieldErrors({});
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
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                <div className="field span-2">
                  <label htmlFor="title">Título del puesto</label>
                  <input
                    id="title"
                    className={fieldErrors.title ? "invalid" : ""}
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    placeholder="Ej: Analista de Sistemas Jr."
                  />
                  {fieldErrors.title && <p className="field-error">{fieldErrors.title}</p>}
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
                  <input
                    id="location"
                    className={fieldErrors.location ? "invalid" : ""}
                    value={form.location}
                    onChange={(e) => update("location", e.target.value)}
                    placeholder="San Miguel de Tucumán"
                  />
                  {fieldErrors.location && <p className="field-error">{fieldErrors.location}</p>}
                </div>
                <div className="field span-2">
                  <label htmlFor="vacancies">Vacantes</label>
                  <input
                    id="vacancies"
                    type="number"
                    min={1}
                    className={fieldErrors.vacancies ? "invalid" : ""}
                    value={form.vacancies}
                    onChange={(e) => update("vacancies", Number(e.target.value))}
                  />
                  {fieldErrors.vacancies && <p className="field-error">{fieldErrors.vacancies}</p>}
                </div>
                <div className="field span-2">
                  <label htmlFor="description">Descripción</label>
                  <textarea
                    id="description"
                    className={fieldErrors.description ? "invalid" : ""}
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="Contá de qué se trata el puesto y qué va a hacer la persona seleccionada."
                  />
                  {fieldErrors.description && <p className="field-error">{fieldErrors.description}</p>}
                </div>
                <div className="field span-2">
                  <label htmlFor="requirements">Requisitos</label>
                  <textarea
                    id="requirements"
                    className={fieldErrors.requirements ? "invalid" : ""}
                    value={form.requirements}
                    onChange={(e) => update("requirements", e.target.value)}
                    placeholder="Ej: 3er año en adelante de Ingeniería en Sistemas, conocimientos de SQL."
                  />
                  {fieldErrors.requirements && <p className="field-error">{fieldErrors.requirements}</p>}
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
