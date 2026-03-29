// src/engine/validation.ts
import { getRDKit } from "./rdkit";
import { Atom, Bond } from "../types/molecule";

/**
 * Converte o estado atual do Grafo para um formato MolBlock simplificado.
 * O RDKit usa esse formato para entender a conectividade.
 */
const generateMolBlock = (
  atoms: Record<string, Atom>,
  bonds: Bond[],
): string => {
  const atomList = Object.values(atoms);
  const nAtoms = atomList.length;
  const nBonds = bonds.length;

  // Cabeçalho básico de um arquivo .mol
  let molBlock = `\n     RDKit          2D\n\n`;
  molBlock += `${nAtoms.toString().padStart(3)}${nBonds.toString().padStart(3)}  0  0  0  0  0  0  0  0  1 V2000\n`;

  // Seção de Átomos
  const atomIdToIndex: Record<string, number> = {};
  atomList.forEach((atom, index) => {
    atomIdToIndex[atom.id] = index + 1;
    const { q, r } = atom.gridPosition;
    // Usamos as coordenadas da grade para o RDKit ter uma noção espacial
    molBlock += `    ${q.toFixed(4)}    ${r.toFixed(4)}    0.0000 ${atom.element.padEnd(3)} 0  0  0  0  0  0  0  0  0  0  0  0\n`;
  });

  // Seção de Ligações
  bonds.forEach((bond) => {
    const sIdx = atomIdToIndex[bond.sourceId];
    const tIdx = atomIdToIndex[bond.targetId];
    molBlock += `${sIdx.toString().padStart(3)}${tIdx.toString().padStart(3)}${bond.order.toString().padStart(3)}  0  0  0  0\n`;
  });

  atomList.forEach((atom, index) => {
    if (atom.charge !== 0) {
      // Formato: M  CHG  [num de entradas]  [indice do átomo]  [carga]
      molBlock += `M  CHG  1 ${String(index + 1).padStart(3)} ${String(atom.charge).padStart(3)}\n`;
    }
  });

  molBlock += "M  END\n";
  return molBlock;
};
/**
 * Tenta criar uma molécula no RDKit. Se falhar, a ligação é quimicamente inválida.
 */
export const isChemistryValid = (
  atoms: Record<string, Atom>,
  bonds: Bond[],
): { valid: boolean; error?: string } => {
  const RDKit = getRDKit();
  const molBlock = generateMolBlock(atoms, bonds);

  // Tenta carregar a molécula. O RDKit tentará "Sanitizar" (validar valências) automaticamente.
  const mol = RDKit.get_mol(molBlock);

  if (!mol) {
    return {
      valid: false,
      error: "Valência excedida ou geometria impossível.",
    };
  }

  // Se chegou aqui, a molécula é válida. Precisamos deletar o objeto da memória C++ do WASM.
  mol.delete();
  return { valid: true };
};
