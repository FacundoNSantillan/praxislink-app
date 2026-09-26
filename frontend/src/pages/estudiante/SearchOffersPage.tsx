import { useEffect, useState } from "react";
import { api, apiErrorMessage } from "../../api/client";
import { PageHeader } from "../../components/AppShell";
import { useToast } from "../../components/Toast";
import type { Offer } from "../../types";

const AREAS = ["Sistemas y Producto", "Comercial y Marketing", "Talent & Placement", "Administración y Legal", "Operaciones"];
const TYPES = ["PPS", "Pasantía", "Primer empleo"];

export function SearchOffersPage() {
  const { showToast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [area, setArea] = useState("");
  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const [applying, setApplying] = useState<string | null>(null);

  function load() {
    const params: Record<string, string> = {};
    if (area) params.area = area;
    if (type) params.type = type;
    if (q) params.q = q;
    api.get<Offer[]>("/offers", { params }).then((res) => setOffers(res.data));
  }

  useEffect(load, [area, type, q]);

  useEffect(() => {
    api.get<string[]>("/applications/applied-offer-ids").then((res) => setAppliedIds(new Set(res.data)));
  }, []);

  async function apply(offer: Offer) {
    setApplying(offer.id);
    try {
      await api.post("/applications", { offerId: offer.id, message: "Postulación enviada desde PraxisLink." });
      setAppliedIds((prev) => new Set(prev).add(offer.id));
      showToast(`¡Postulación enviada a ${offer.company?.name}!`);
    } catch (err) {
      showToast(apiErrorMessage(err, "No pudimos enviar tu postulación."));
    } finally {
      setApplying(null);
    }
  }

  return (
    <>
      <PageHeader title="Buscar ofertas" subtitle="Prácticas, pasantías y primer empleo de empresas asociadas" />
      <main className="view-area">
        <div className="view-section">
          <div className="filter-bar">
            <select value={area} onChange={(e) => setArea(e.target.value)}>
              <option value="">Todas las áreas</option>
              {AREAS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Todos los tipos</option>
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <input type="search" placeholder="Buscar por puesto o empresa…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>

          {offers.length === 0 ? (
            <p style={{ color: "var(--ink-faint)", fontSize: ".9rem" }}>No encontramos ofertas con esos filtros.</p>
          ) : (
            <div className="card-grid">
              {offers.map((o) => {
                const applied = appliedIds.has(o.id);
                return (
                  <article key={o.id} className="offer-card">
                    <div>
                      <h4>{o.title}</h4>
                      <div className="company">{o.company?.name}</div>
                    </div>
                    <div className="offer-meta">
                      <span className="tag">{o.type}</span>
                      <span className="tag">{o.modality}</span>
                      <span className="tag">{o.area}</span>
                    </div>
                    <p className="desc">{o.description}</p>
                    <div className="offer-card-foot">
                      <span className="loc">{o.location}</span>
                      <button
                        className={`btn btn-sm ${applied ? "btn-outline" : "btn-primary"}`}
                        disabled={applied || applying === o.id}
                        onClick={() => apply(o)}
                      >
                        {applied ? "Postulado ✓" : applying === o.id ? "Enviando…" : "Postularme"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
