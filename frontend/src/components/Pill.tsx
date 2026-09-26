const STATUS_CLASS: Record<string, string> = {
  Nuevo: "pending",
  "En revisión": "review",
  Entrevista: "review",
  Contratado: "ok",
  Rechazado: "crit",
  Activa: "ok",
  Cerrada: "pending",
  Vigente: "ok",
  "Pendiente firma": "review",
  Vencido: "crit",
};

export function Pill({ status }: { status: string }) {
  const cls = STATUS_CLASS[status] || "pending";
  return <span className={`pill ${cls}`}>{status}</span>;
}

export function statusClass(status: string): string {
  return STATUS_CLASS[status] || "pending";
}
