export type UserRole = "empresa" | "estudiante" | "universidad" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface CompanyProfile {
  id: string;
  userId: string;
  name: string;
  rubro: string;
  site: string;
  size: string;
  description: string;
  logoPath?: string | null;
}

export interface StudentProfile {
  id: string;
  userId: string;
  name: string;
  university: string;
  career: string;
  year: string;
  location: string;
  availability: string;
  skills: string[];
  avatarPath?: string | null;
  cvPath?: string | null;
  cvOriginalName?: string | null;
  cvKeywords: string[];
}

export interface UniversityProfile {
  id: string;
  userId: string;
  name: string;
  location: string;
  description: string;
  logoPath?: string | null;
}

export type OfferType = "PPS" | "Pasantía" | "Primer empleo";
export type OfferModality = "Híbrida" | "Presencial" | "Remota";
export type OfferStatus = "Activa" | "Cerrada";

export interface Offer {
  id: string;
  companyId: string;
  company?: CompanyProfile;
  title: string;
  area: string;
  type: OfferType;
  modality: OfferModality;
  location: string;
  vacancies: number;
  description: string;
  requirements: string;
  status: OfferStatus;
  createdAt: string;
}

export type ApplicationStatus = "Nuevo" | "En revisión" | "Entrevista" | "Contratado" | "Rechazado";

export interface Application {
  id: string;
  offerId: string;
  offer?: Offer;
  studentId: string;
  student?: StudentProfile;
  message: string;
  matchScore: number;
  matchedKeywords: string[];
  status: ApplicationStatus;
  createdAt: string;
}

export type AgreementStatus = "Vigente" | "Pendiente firma" | "Vencido";

export interface Agreement {
  id: string;
  universityId: string;
  companyId: string;
  company?: CompanyProfile;
  type: string;
  status: AgreementStatus;
  signedAt: string;
}

export interface Plan {
  id: string;
  role: "empresa" | "universidad";
  name: string;
  description: string;
  priceArs: number;
  maxActiveOffers: number | null;
  maxVisibleOffers: number | null;
  sortOrder: number;
}

export interface Subscription {
  id: string | null;
  userId: string;
  plan: Plan;
  planId: string;
  status: "activa" | "cancelada";
  startedAt: string | null;
}

export interface AdminUserRow {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  name: string;
  extra: string;
  plan: { name: string; priceArs: number } | null;
}

export interface AdminStats {
  totalUsers: number;
  totalOffers: number;
  activeOffers: number;
  totalApplications: number;
  totalAgreements: number;
  monthlyRevenue: number;
  payingAccounts: number;
  usersByRole: { role: UserRole; count: number }[];
}
