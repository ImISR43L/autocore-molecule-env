import { create } from "zustand";
import { Atom, Bond, BondOrder, StereoType } from "../types/molecule";
import { isChemistryValid } from "../engine/validation";
import { CustomHex, gridInstance } from "../utils/grid";

interface MoleculeState {
  atoms: Record<string, Atom>;
  bonds: Bond[];
  selectedAtomId: string | null;
  activePaletteElement: string | null; // <-- NOVO: Elemento selecionado na paleta

  // Ações
  setActiveElement: (element: string) => void; // <-- NOVO: Ação para selecionar na paleta
  addAtomToGrid: (q: number, r: number) => void; // <-- NOVO: Ação para clicar na grade e adicionar
  updateAtomPosition: (id: string, q: number, r: number) => void;
  selectAtom: (id: string) => void;
}

const isOccupied = (atoms: Record<string, Atom>, q: number, r: number) => {
  return Object.values(atoms).some(
    (a) => a.gridPosition.q === q && a.gridPosition.r === r,
  );
};

export const useMoleculeStore = create<MoleculeState>((set, get) => ({
  atoms: {},
  bonds: [],
  selectedAtomId: null,
  activePaletteElement: null, // Inicialmente nada selecionado

  // NOVO: Define qual elemento o utilizador quer desenhar
  setActiveElement: (element) => set({ activePaletteElement: element }),

  // NOVO: Adiciona o elemento ativo na posição clicada da grade
  addAtomToGrid: (q, r) =>
    set((state) => {
      const { activePaletteElement, atoms } = state;

      // Se não houver elemento selecionado na paleta, ou a casa estiver ocupada, ignora
      if (!activePaletteElement || isOccupied(atoms, q, r)) {
        return state;
      }

      const newId = `atom_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const newAtom: Atom = {
        id: newId,
        element: activePaletteElement,
        charge: 0,
        gridPosition: { q, r },
      };

      return {
        atoms: { ...atoms, [newId]: newAtom },
        // Opcional: Limpar a seleção da paleta após adicionar
        activePaletteElement: null,
      };
    }),

  updateAtomPosition: (id, q, r) =>
    set((state) => {
      const atom = state.atoms[id];
      if (!atom) return state;
      return {
        atoms: { ...state.atoms, [id]: { ...atom, gridPosition: { q, r } } },
      };
    }),

  selectAtom: (id) =>
    set((state) => {
      const { selectedAtomId, bonds, atoms } = state;

      if (selectedAtomId === id || !selectedAtomId) {
        return { selectedAtomId: id === selectedAtomId ? null : id };
      }

      // Verificar se já existe ligação
      const bondExists = bonds.some(
        (b) =>
          (b.sourceId === selectedAtomId && b.targetId === id) ||
          (b.sourceId === id && b.targetId === selectedAtomId),
      );
      if (bondExists) return { selectedAtomId: null };

      // Criar uma ligação temporária para teste
      const potentialBond: Bond = {
        id: `temp`,
        sourceId: selectedAtomId,
        targetId: id,
        order: BondOrder.SINGLE,
        stereo: StereoType.NONE,
      };

      // VALIDAR COM RDKit
      const validation = isChemistryValid(atoms, [...bonds, potentialBond]);

      if (!validation.valid) {
        alert(`Erro Químico: ${validation.error}`); // No futuro, use um Toast mais elegante
        return { selectedAtomId: null };
      }

      // Se for válido, adiciona de verdade
      const finalBond = { ...potentialBond, id: `bond_${Date.now()}` };
      return {
        bonds: [...bonds, finalBond],
        selectedAtomId: null,
      };
    }),
}));
