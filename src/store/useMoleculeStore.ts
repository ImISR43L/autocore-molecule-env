import { create } from "zustand";
import { Atom, Bond, BondOrder, StereoType } from "../types/molecule";
import { isChemistryValid } from "../engine/validation";

export type BuilderMode = "INORGANIC" | "ORGANIC";

interface MoleculeState {
  atoms: Record<string, Atom>;
  bonds: Bond[];
  selectedAtomId: string | null;
  activePaletteElement: string | null; // <-- NOVO: Elemento selecionado na paleta
  isGridVisible: boolean;
  dragPositions: Record<string, { x: number; y: number }>;
  mode: BuilderMode; // NOVO

  // Ações
  setActiveElement: (element: string) => void; // <-- NOVO: Ação para selecionar na paleta
  addAtomToGrid: (q: number, r: number) => void; // <-- NOVO: Ação para clicar na grade e adicionar
  updateAtomPosition: (id: string, q: number, r: number) => void;
  selectAtom: (id: string) => void;
  removeAtom: (id: string) => void;
  cycleBondOrder: (bondId: string) => void;
  removeBond: (id: string) => void;
  modifyAtomCharge: (id: string, delta: number) => void;
  toggleGrid: () => void;
  setAtomDragPosition: (
    id: string,
    pos: { x: number; y: number } | null,
  ) => void; // NOVO
  setMode: (mode: BuilderMode) => void;
  addOrganicConnection: (
    sourceId: string | null,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
  ) => void;
  modifyOrganicBond: (bondId: string, tool: string) => void;
  modifyOrganicAtom: (atomId: string, element: string) => void;
}

const isOccupied = (atoms: Record<string, Atom>, q: number, r: number) => {
  return Object.values(atoms).some(
    (a) => a.gridPosition.q === q && a.gridPosition.r === r,
  );
};

export const useMoleculeStore = create<MoleculeState>((set) => ({
  atoms: {},
  bonds: [],
  selectedAtomId: null,
  activePaletteElement: null, // Inicialmente nada selecionado
  isGridVisible: true,
  dragPositions: {},
  mode: "INORGANIC",

  setMode: (mode) => set({ mode }),

  // NOVO: Define qual elemento o utilizador quer desenhar
  setActiveElement: (element) =>
    set((state) => ({
      activePaletteElement:
        state.activePaletteElement === element ? null : element,
    })),

  addAtomToGrid: (q, r) =>
    set((state) => {
      const { activePaletteElement, atoms } = state;

      // Se não houver elemento, ou se a casa estiver ocupada, ignora
      if (!activePaletteElement || isOccupied(atoms, q, r)) return state;

      // CORREÇÃO: Impede que ferramentas sejam desenhadas como átomos
      const tools = ["ERASER", "CHARGE_PLUS", "CHARGE_MINUS"];
      if (tools.includes(activePaletteElement)) return state;

      const newId = `atom_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const newAtom: Atom = {
        id: newId,
        element: activePaletteElement,
        charge: 0,
        gridPosition: { q, r },
      };

      return {
        atoms: { ...atoms, [newId]: newAtom },
      };
    }),

  removeAtom: (id) =>
    set((state) => {
      // 1. Removemos o átomo do dicionário
      const { [id]: _, ...remainingAtoms } = state.atoms;

      // 2. Removemos todas as ligações que apontavam para esse átomo
      const remainingBonds = state.bonds.filter(
        (bond) => bond.sourceId !== id && bond.targetId !== id,
      );

      return {
        atoms: remainingAtoms,
        bonds: remainingBonds,
        // Se o átomo removido estava selecionado para uma ligação, limpamos a seleção
        selectedAtomId:
          state.selectedAtomId === id ? null : state.selectedAtomId,
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

  setAtomDragPosition: (id, pos) =>
    set((state) => {
      // Se pos for null, o arrasto terminou, então removemos o átomo do dicionário
      if (pos === null) {
        const { [id]: _, ...remainingDrags } = state.dragPositions;
        return { dragPositions: remainingDrags };
      }
      // Caso contrário, atualizamos a posição em tempo real
      return { dragPositions: { ...state.dragPositions, [id]: pos } };
    }),

  cycleBondOrder: (bondId) =>
    set((state) => {
      const bondIndex = state.bonds.findIndex((b) => b.id === bondId);
      if (bondIndex === -1) return state;

      const currentBond = state.bonds[bondIndex];
      // Ciclo: 1 -> 2 -> 3 -> 1
      const nextOrder =
        currentBond.order >= 3 ? 1 : ((currentBond.order + 1) as BondOrder);

      // Criamos uma cópia das ligações com a nova ordem para validar
      const updatedBonds = [...state.bonds];
      updatedBonds[bondIndex] = { ...currentBond, order: nextOrder };

      // Validação Química com RDKit
      const validation = isChemistryValid(state.atoms, updatedBonds);
      if (!validation.valid) {
        alert(`Violação de Valência: ${validation.error}`);
        return state;
      }

      return { bonds: updatedBonds };
    }),

  removeBond: (id) =>
    set((state) => ({
      bonds: state.bonds.filter((bond) => bond.id !== id),
    })),

  modifyAtomCharge: (id, delta) =>
    set((state) => {
      const atom = state.atoms[id];
      if (!atom) return state;

      let newCharge = atom.charge + delta;

      // 1. TRAVA LÓGICA: Limites do mundo real (Evita +50 ou -50)
      // Para inorgânica, cargas de -4 a +4 cobrem 99% dos casos práticos
      const MAX_CHARGE = 4;
      const MIN_CHARGE = -4;

      if (newCharge > MAX_CHARGE) newCharge = MAX_CHARGE;
      if (newCharge < MIN_CHARGE) newCharge = MIN_CHARGE;

      // Se o limite impediu a mudança de ocorrer, nem precisamos chamar o RDKit
      if (newCharge === atom.charge) return state;

      // 2. TRAVA ESTRUTURAL (RDKit)
      const updatedAtoms = {
        ...state.atoms,
        [id]: { ...atom, charge: newCharge },
      };

      const validation = isChemistryValid(updatedAtoms, state.bonds);

      if (!validation.valid) {
        console.warn(
          `Carga estruturalmente rejeitada pelo RDKit: ${validation.error}`,
        );
        return state;
      }

      return { atoms: updatedAtoms };
    }),

  toggleGrid: () => set((state) => ({ isGridVisible: !state.isGridVisible })),

  addOrganicConnection: (sourceId, startX, startY, endX, endY) =>
    set((state) => {
      const newAtoms = { ...state.atoms };
      const newBonds = [...state.bonds];

      // Gerador de IDs únicos
      const genId = () =>
        `atom_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const bondId = `bond_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      let actualSourceId = sourceId;

      // Se não clicou num átomo existente, criamos o primeiro Carbono no ponto inicial
      if (!actualSourceId) {
        actualSourceId = genId();
        newAtoms[actualSourceId] = {
          id: actualSourceId,
          element: "C", // Orgânica é baseada em Carbono por defeito
          charge: 0,
          gridPosition: { q: 0, r: 0 }, // Ignorado no orgânico
          x: startX,
          y: startY,
        };
      }

      // Criamos o segundo Carbono no ponto final (onde o rato soltou)
      const targetId = genId();
      newAtoms[targetId] = {
        id: targetId,
        element: "C",
        charge: 0,
        gridPosition: { q: 0, r: 0 },
        x: endX,
        y: endY,
      };

      // Ligamos os dois
      newBonds.push({
        id: bondId,
        sourceId: actualSourceId,
        targetId: targetId,
        order: 1, // Ligação simples por defeito
        stereo: StereoType.NONE,
      });

      return { atoms: newAtoms, bonds: newBonds };
    }),

  modifyOrganicBond: (bondId, tool) =>
    set((state) => {
      const bondIndex = state.bonds.findIndex((b) => b.id === bondId);
      if (bondIndex === -1) return state;

      // Se a ferramenta for a Borracha, removemos a ligação
      if (tool === "ERASER") {
        return { bonds: state.bonds.filter((b) => b.id !== bondId) };
      }

      const updatedBonds = [...state.bonds];
      const bond = { ...updatedBonds[bondIndex] };

      // Aplica as propriedades corretas com base na ferramenta
      switch (tool) {
        case "BOND_SINGLE":
          bond.order = 1;
          bond.stereo = StereoType.NONE;
          break;
        case "BOND_DOUBLE":
          bond.order = 2;
          bond.stereo = StereoType.NONE;
          break;
        case "BOND_TRIPLE":
          bond.order = 3;
          bond.stereo = StereoType.NONE;
          break;
        case "BOND_WEDGE":
          bond.order = 1;
          bond.stereo = StereoType.WEDGE;
          break;
        case "BOND_DASH":
          bond.order = 1;
          bond.stereo = StereoType.DASH;
          break;
        default:
          return state; // Se clicou com um átomo ou outra ferramenta, não faz nada
      }

      updatedBonds[bondIndex] = bond;
      return { bonds: updatedBonds };
    }),

  modifyOrganicAtom: (id, element) =>
    set((state) => {
      const atom = state.atoms[id];
      if (!atom) return state;

      // Altera o elemento químico do vértice
      return {
        atoms: { ...state.atoms, [id]: { ...atom, element } },
      };
    }),
}));
