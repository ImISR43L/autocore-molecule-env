// src/utils/elements.ts

export interface ElementVisualData {
  color: string;
  textColor: string;
  radiusScale: number;
}

// Tabela de Cores CPK e tamanhos relativos aproximados
export const ELEMENT_DATA: Record<string, ElementVisualData> = {
  H: { color: "#FFFFFF", textColor: "#333333", radiusScale: 0.65 },
  C: { color: "#333333", textColor: "#FFFFFF", radiusScale: 1.0 },
  N: { color: "#3050F8", textColor: "#FFFFFF", radiusScale: 0.95 },
  O: { color: "#FF0D0D", textColor: "#FFFFFF", radiusScale: 0.9 },
  F: { color: "#90E050", textColor: "#333333", radiusScale: 0.85 },
  Cl: { color: "#1FF01F", textColor: "#333333", radiusScale: 1.15 },
  Fe: { color: "#E06633", textColor: "#FFFFFF", radiusScale: 1.3 },
  // Fallback para elementos não mapeados
  DEFAULT: { color: "#95a5a6", textColor: "#FFFFFF", radiusScale: 1.0 },
};
