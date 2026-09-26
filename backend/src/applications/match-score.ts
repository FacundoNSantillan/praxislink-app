import { Offer } from "../offers/entities/offer.entity";
import { StudentProfile } from "../users/entities/student-profile.entity";
import { containsTerm } from "./cv-keywords";

const STOPWORDS = new Set([
  "de", "la", "el", "en", "y", "a", "para", "con", "los", "las", "un", "una",
  "del", "por", "que", "se", "su", "sus",
]);

function meaningfulWords(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita tildes tras la normalización NFD
    .split(/[^a-z0-9+]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

export interface MatchBreakdown {
  total: number;
  cvKeywordScore: number;
  skillScore: number;
  careerScore: number;
  hasCvBonus: number;
  completenessBonus: number;
  matchedCvKeywords: string[];
  matchedSkills: string[];
}

/**
 * Calcula un puntaje de compatibilidad (0-100) entre el perfil de un estudiante
 * y una oferta. A diferencia de un puntaje al azar, se arma con señales reales
 * del perfil:
 *  - palabras clave detectadas automáticamente en el PDF del CV que también
 *    aparecen en los requisitos/descripción de la oferta (hasta 40 pts) — este
 *    es el componente principal: es lo que el estudiante realmente puso en su CV,
 *    no lo que tipeó a mano.
 *  - habilidades cargadas manualmente en el perfil que coinciden con la oferta (hasta 25 pts)
 *  - si su carrera se relaciona con el área/título de la oferta (hasta 15 pts)
 *  - completitud del perfil: tener CV cargado (+10) y al menos 3 habilidades (+10)
 * No es un modelo de IA: es una heurística simple pero real sobre datos del perfil,
 * pensada para un prototipo académico.
 */
export function computeMatchBreakdown(student: StudentProfile, offer: Offer): MatchBreakdown {
  const offerText = `${offer.title} ${offer.area} ${offer.description} ${offer.requirements}`;

  const cvKeywords = (student.cvKeywords || []).map((k) => k.trim()).filter(Boolean);
  const matchedCvKeywords = cvKeywords.filter((k) => containsTerm(offerText, k));
  const cvKeywordScore =
    cvKeywords.length > 0 ? Math.round((matchedCvKeywords.length / cvKeywords.length) * 40) : 0;

  const skills = (student.skills || []).map((s) => s.trim()).filter(Boolean);
  const matchedSkills = skills.filter((skill) => containsTerm(offerText, skill));
  const skillScore = skills.length > 0 ? Math.round((matchedSkills.length / skills.length) * 25) : 0;

  const careerWords = new Set(meaningfulWords(`${student.career} ${student.university}`));
  const offerWords = meaningfulWords(`${offer.area} ${offer.title}`);
  const careerOverlap = offerWords.filter((w) => careerWords.has(w)).length;
  const careerScore = careerOverlap > 0 ? 15 : 0;

  const hasCvBonus = student.cvPath ? 10 : 0;
  const completenessBonus = skills.length >= 3 ? 10 : 0;

  const raw = cvKeywordScore + skillScore + careerScore + hasCvBonus + completenessBonus;
  const total = Math.min(98, Math.max(35, raw));

  return { total, cvKeywordScore, skillScore, careerScore, hasCvBonus, completenessBonus, matchedCvKeywords, matchedSkills };
}

export function computeMatchScore(student: StudentProfile, offer: Offer): number {
  return computeMatchBreakdown(student, offer).total;
}
