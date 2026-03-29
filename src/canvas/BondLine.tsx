// src/canvas/BondLine.tsx
import React from "react";
import { Line } from "react-konva";
import { Bond } from "../types/molecule";
import { CustomHex } from "../utils/grid";
import { useMoleculeStore } from "../store/useMoleculeStore";

interface BondLineProps {
  bond: Bond;
}

export const BondLine: React.FC<BondLineProps> = ({ bond }) => {
  // O componente "escuta" apenas os dois átomos envolvidos nesta ligação.
  // Se um deles for arrastado, APENAS esta linha é re-renderizada!
  const sourceAtom = useMoleculeStore((state) => state.atoms[bond.sourceId]);
  const targetAtom = useMoleculeStore((state) => state.atoms[bond.targetId]);

  if (!sourceAtom || !targetAtom) return null;

  const sourceHex = new CustomHex({
    q: sourceAtom.gridPosition.q,
    r: sourceAtom.gridPosition.r,
  });
  const targetHex = new CustomHex({
    q: targetAtom.gridPosition.q,
    r: targetAtom.gridPosition.r,
  });

  return (
    <Line
      // Array de coordenadas [x1, y1, x2, y2]
      points={[sourceHex.x, sourceHex.y, targetHex.x, targetHex.y]}
      stroke="#cccccc" // Uma cor cinza claro para a ligação
      strokeWidth={6}
      lineCap="round"
      listening={false} // Evita roubar eventos de clique dos átomos
      perfectDrawEnabled={false} // Otimização de performance
    />
  );
};
