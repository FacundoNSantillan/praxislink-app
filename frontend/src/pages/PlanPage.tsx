import { FormEvent, useEffect, useState } from "react";
import { api } from "../api/client";
import { PageHeader } from "../components/AppShell";
import { useToast } from "../components/Toast";
import type { Plan, Subscription } from "../types";

const ARS = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

type CheckoutStep = "form" | "processing" | "success";

function featuresFor(plan: Plan): string[] {
  const feats: string[] = [];
  if (plan.role === "empresa") {
    feats.push(plan.maxActiveOffers == null ? "Ofertas activas sin límite" : `Hasta ${plan.maxActiveOffers} oferta(s) activa(s)`);
    feats.push("Panel de postulantes y matching automático");
  } else {
    feats.push(plan.maxVisibleOffers == null ? "Todas las ofertas de la red, sin límite" : `Hasta ${plan.maxVisibleOffers} ofertas visibles para tus alumnos`);
    feats.push("Panel de convenios y seguimiento de alumnos");
  }
  return feats;
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

const EMPTY_CARD = { holder: "", number: "", expiry: "", cvv: "" };

export function PlanPage() {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
  const [step, setStep] = useState<CheckoutStep>("form");
  const [card, setCard] = useState(EMPTY_CARD);
  const [cardError, setCardError] = useState<string | null>(null);

  function load() {
    Promise.all([api.get<Plan[]>("/plans"), api.get<Subscription>("/plans/me")]).then(([plansRes, subRes]) => {
      setPlans(plansRes.data.sort((a, b) => a.sortOrder - b.sortOrder));
      setSubscription(subRes.data);
    });
  }

  useEffect(load, []);

  function openCheckout(plan: Plan) {
    setCheckoutPlan(plan);
    setStep("form");
    setCard(EMPTY_CARD);
    setCardError(null);
  }

  function closeCheckout() {
    setCheckoutPlan(null);
    setStep("form");
    setCard(EMPTY_CARD);
    setCardError(null);
  }

  async function finishSubscription(plan: Plan) {
    await api.post("/plans/subscribe", { planId: plan.id });
    load();
  }

  async function handleFreeConfirm() {
    if (!checkoutPlan) return;
    setStep("processing");
    await finishSubscription(checkoutPlan);
    setStep("success");
  }

  async function handlePaySubmit(e: FormEvent) {
    e.preventDefault();
    if (!checkoutPlan) return;
    setCardError(null);

    const digits = card.number.replace(/\s/g, "");
    if (digits.length !== 16) {
      setCardError("El número de tarjeta debe tener 16 dígitos.");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) {
      setCardError("La fecha de vencimiento debe tener el formato MM/AA.");
      return;
    }
    const month = Number(card.expiry.slice(0, 2));
    if (month < 1 || month > 12) {
      setCardError("El mes de vencimiento no es válido.");
      return;
    }
    if (card.cvv.length !== 3) {
      setCardError("El código de seguridad debe tener 3 dígitos.");
      return;
    }
    if (!card.holder.trim()) {
      setCardError("Ingresá el nombre del titular de la tarjeta.");
      return;
    }

    setStep("processing");
    await new Promise((r) => setTimeout(r, 1400));
    await finishSubscription(checkoutPlan);
    setStep("success");
  }

  return (
    <>
      <PageHeader title="Tu plan" subtitle="Elegí cuántas oportunidades querés publicar o recibir por mes" />
      <main className="view-area">
        <div className="view-section">
          <div className="plan-grid">
            {plans.map((plan) => {
              const isCurrent = subscription?.plan?.id === plan.id;
              return (
                <div key={plan.id} className={`plan-card${isCurrent ? " current" : ""}`}>
                  <div className="eyebrow">{plan.priceArs === 0 ? "Gratis" : "Plan pago"}</div>
                  <h3>{plan.name}</h3>
                  <div className="plan-price">
                    {plan.priceArs === 0 ? "$0" : ARS.format(plan.priceArs)}
                    {plan.priceArs > 0 && <span> /mes</span>}
                  </div>
                  <p style={{ margin: 0, fontSize: ".86rem", color: "var(--ink-soft)" }}>{plan.description}</p>
                  <ul>
                    {featuresFor(plan).map((f) => (
                      <li key={f}>
                        <span style={{ color: "var(--st-ok)" }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <button className="btn btn-outline btn-block" disabled>
                      Plan actual
                    </button>
                  ) : (
                    <button className="btn btn-primary btn-block" onClick={() => openCheckout(plan)}>
                      {plan.priceArs === 0 ? "Cambiar a este plan" : "Elegir este plan"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {checkoutPlan && (
        <div className="modal-overlay" onClick={() => step !== "processing" && closeCheckout()}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            {step !== "processing" && (
              <button className="modal-close-x" onClick={closeCheckout} aria-label="Cerrar">
                &times;
              </button>
            )}

            {checkoutPlan.priceArs === 0 && step === "form" && (
              <>
                <span className="eyebrow">Confirmar plan</span>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 600, margin: "10px 0 6px" }}>{checkoutPlan.name}</h3>
                <p style={{ color: "var(--ink-soft)", fontSize: ".9rem", marginBottom: 18 }}>
                  Vas a pasar a este plan de inmediato, sin costo.
                </p>
                <button className="btn btn-primary btn-block" onClick={handleFreeConfirm}>
                  Confirmar cambio
                </button>
              </>
            )}

            {checkoutPlan.priceArs > 0 && step === "form" && (
              <>
                <span className="eyebrow">Pago con tarjeta</span>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 600, margin: "10px 0 4px" }}>{checkoutPlan.name}</h3>
                <div className="plan-price" style={{ marginBottom: 18 }}>
                  {ARS.format(checkoutPlan.priceArs)}
                  <span> /mes</span>
                </div>
                {cardError && <div className="auth-error">{cardError}</div>}
                <form onSubmit={handlePaySubmit}>
                  <div className="field">
                    <label>Titular de la tarjeta</label>
                    <input
                      required
                      value={card.holder}
                      onChange={(e) => setCard((c) => ({ ...c, holder: e.target.value }))}
                      placeholder="Como figura en la tarjeta"
                    />
                  </div>
                  <div className="field">
                    <label>Número de tarjeta</label>
                    <input
                      required
                      inputMode="numeric"
                      value={card.number}
                      onChange={(e) => setCard((c) => ({ ...c, number: formatCardNumber(e.target.value) }))}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                    />
                  </div>
                  <div className="form-grid">
                    <div className="field">
                      <label>Vencimiento</label>
                      <input
                        required
                        inputMode="numeric"
                        value={card.expiry}
                        onChange={(e) => setCard((c) => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                        placeholder="MM/AA"
                        maxLength={5}
                      />
                    </div>
                    <div className="field">
                      <label>Código de seguridad</label>
                      <input
                        required
                        inputMode="numeric"
                        value={card.cvv}
                        onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) }))}
                        placeholder="CVV"
                        maxLength={3}
                      />
                    </div>
                  </div>
                  <button className="btn btn-primary btn-block" type="submit" style={{ marginTop: 6 }}>
                    Pagar {ARS.format(checkoutPlan.priceArs)}
                  </button>
                </form>
              </>
            )}

            {step === "processing" && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    margin: "0 auto 18px",
                    borderRadius: "50%",
                    border: "3px solid var(--line)",
                    borderTopColor: "var(--accent)",
                    animation: "praxislink-spin 0.8s linear infinite",
                  }}
                />
                <p style={{ margin: 0, fontSize: ".92rem", color: "var(--ink-soft)" }}>Procesando el pago…</p>
                <style>{"@keyframes praxislink-spin { to { transform: rotate(360deg); } }"}</style>
              </div>
            )}

            {step === "success" && (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    margin: "0 auto 16px",
                    borderRadius: "50%",
                    background: "color-mix(in srgb, var(--st-ok) 16%, transparent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="var(--st-ok)" strokeWidth={2}>
                    <path d="M4 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 6 }}>
                  {checkoutPlan.priceArs === 0 ? "¡Listo!" : "¡Pago aprobado!"}
                </h3>
                <p style={{ color: "var(--ink-soft)", fontSize: ".9rem", marginBottom: 20 }}>
                  Ya estás en el plan {checkoutPlan.name}.
                </p>
                <button
                  className="btn btn-primary btn-block"
                  onClick={() => {
                    showToast(`Ahora estás en el plan ${checkoutPlan.name}.`);
                    closeCheckout();
                  }}
                >
                  Listo
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
