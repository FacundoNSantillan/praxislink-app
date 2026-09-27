import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import { PageHeader } from "../../components/AppShell";
import type { AdminStats, AdminUserRow, UserRole } from "../../types";

const ARS = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

const ROLE_LABELS: Record<UserRole, string> = {
  empresa: "Empresa",
  estudiante: "Estudiante",
  universidad: "Universidad",
  admin: "Administrador",
};

const ROLE_TAG_STYLE: Record<UserRole, string> = {
  empresa: "ok",
  estudiante: "pending",
  universidad: "review",
  admin: "crit",
};

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
}

export function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get<AdminStats>("/admin/stats").then((res) => setStats(res.data));
    api.get<AdminUserRow[]>("/admin/users").then((res) => setUsers(res.data));
  }, []);

  const filtered = useMemo(() => {
    return users
      .filter((u) => (roleFilter ? u.role === roleFilter : true))
      .filter((u) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q);
      });
  }, [users, roleFilter, search]);

  const countFor = (role: UserRole) => stats?.usersByRole.find((r) => r.role === role)?.count ?? 0;

  return (
    <>
      <PageHeader title="Panel de administración" subtitle="Usuarios, planes y actividad de toda la plataforma" />
      <main className="view-area">
        <div className="view-section">
          <div className="stat-grid">
            <div className="stat-card">
              <span className="lbl">Usuarios totales</span>
              <span className="num">{stats?.totalUsers ?? "—"}</span>
            </div>
            <div className="stat-card">
              <span className="lbl">Empresas / Universidades / Estudiantes</span>
              <span className="num small">
                {countFor("empresa")} / {countFor("universidad")} / {countFor("estudiante")}
              </span>
            </div>
            <div className="stat-card">
              <span className="lbl">Ofertas activas</span>
              <span className="num">{stats?.activeOffers ?? "—"}</span>
            </div>
            <div className="stat-card">
              <span className="lbl">Postulaciones totales</span>
              <span className="num">{stats?.totalApplications ?? "—"}</span>
            </div>
            <div className="stat-card">
              <span className="lbl">Convenios totales</span>
              <span className="num">{stats?.totalAgreements ?? "—"}</span>
            </div>
            <div className="stat-card">
              <span className="lbl">Cuentas con plan pago</span>
              <span className="num">{stats?.payingAccounts ?? "—"}</span>
            </div>
            <div className="stat-card">
              <span className="lbl">Facturación mensual estimada</span>
              <span className="num small">{stats ? ARS.format(stats.monthlyRevenue) : "—"}</span>
            </div>
          </div>
        </div>

        <div className="view-section">
          <div className="view-section-head">
            <h3>Usuarios</h3>
            <span className="hint">{filtered.length} de {users.length}</span>
          </div>
          <div className="filter-bar">
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as UserRole | "")}>
              <option value="">Todos los roles</option>
              <option value="empresa">Empresas</option>
              <option value="estudiante">Estudiantes</option>
              <option value="universidad">Universidades</option>
              <option value="admin">Administradores</option>
            </select>
            <input
              type="search"
              placeholder="Buscar por nombre o email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Detalle</th>
                  <th>Plan</th>
                  <th>Alta</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr className="empty-row">
                    <td colSpan={5}>No hay usuarios para este filtro.</td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span className="avatar a">{initials(u.name === "—" ? u.email : u.name)}</span>
                          <span>
                            <span className="cell-primary">{u.name}</span>
                            <span className="cell-sub">{u.email}</span>
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`pill ${ROLE_TAG_STYLE[u.role]}`}>{ROLE_LABELS[u.role]}</span>
                      </td>
                      <td>{u.extra || "—"}</td>
                      <td>
                        {u.plan ? (
                          <>
                            {u.plan.name}
                            <span className="cell-sub">
                              {u.plan.priceArs === 0 ? "Gratis" : `${ARS.format(u.plan.priceArs)}/mes`}
                            </span>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString("es-AR")}</td>
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
