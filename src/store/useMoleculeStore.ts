import { create } from "zustand";
import { Atom, Bond, BondOrder, StereoType } from "../types/molecule";

interface MoleculeState {
  atoms: Record<string, Atom>;
  bonds: Bond[];
  selectedAtomId: string | null; // Guarda o ID do átomo que o utilizador clicou primeiro

  addAtom: (element: string, q: number, r: number) => void;
  updateAtomPosition: (id: string, q: number, r: number) => void;
  selectAtom: (id: string) => void; // Nova ação para gerir cliques
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

  addAtom: (element, q, r) =>
    set((state) => {
      let targetQ = q;
      while (isOccupied(state.atoms, targetQ, r)) {
        targetQ++;
      }

      // Adicionamos um número aleatório para garantir IDs 100% únicos caso o utilizador clique muito rápido
      const newId = `atom_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      return {
        atoms: {
          ...state.atoms,
          [newId]: {
            id: newId,
            element,
            charge: 0,
            gridPosition: { q: targetQ, r },
          },
        },
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
      const { selectedAtomId, bonds } = state;

      // Se clicar no mesmo átomo que já está selecionado, ele é desmarcado
      if (selectedAtomId === id) {
        return { selectedAtomId: null };
      }

      // Se não havia nenhum selecionado, seleciona este
      if (!selectedAtomId) {
        return { selectedAtomId: id };
      }

      // Se já havia um selecionado e clicou noutro, CRIAMOS A LIGAÇÃO!
      // Primeiro, evitamos ligações duplicadas entre os mesmos dois átomos
      const bondExists = bonds.some(
        (b) =>
          (b.sourceId === selectedAtomId && b.targetId === id) ||
          (b.sourceId === id && b.targetId === selectedAtomId),
      );

      if (bondExists) {
        return { selectedAtomId: null }; // Cancela a ação se já estiverem ligados
      }

      const newBond: Bond = {
        id: `bond_${Date.now()}`,
        sourceId: selectedAtomId,
        targetId: id,
        order: BondOrder.SINGLE,
        stereo: StereoType.NONE,
      };

      return {
        bonds: [...bonds, newBond],
        selectedAtomId: null, // Limpa a seleção após ligar
      };
    }),
}));
