// src/canvas/BondLine.tsx
import React from "react";
import { Line, Group } from "react-konva";
import { Bond, BondOrder } from "../types/molecule";
import { CustomHex } from "../utils/grid";
import { useMoleculeStore } from "../store/useMoleculeStore";

export const BondLine: React.FC<{ bond: Bond }> = ({ bond }) => {
  const sourceAtom = useMoleculeStore((state) => state.atoms[bond.sourceId]);
  const targetAtom = useMoleculeStore((state) => state.atoms[bond.targetId]);
  const removeBond = useMoleculeStore((state) => state.removeBond);
  const cycleBondOrder = useMoleculeStore((state) => state.cycleBondOrder);
  const activePaletteElement = useMoleculeStore(
    (state) => state.activePaletteElement,
  );

  if (!sourceAtom || !targetAtom) return null;

  const s = new CustomHex({
    q: sourceAtom.gridPosition.q,
    r: sourceAtom.gridPosition.r,
  });
  const t = new CustomHex({
    q: targetAtom.gridPosition.q,
    r: targetAtom.gridPosition.r,
  });

  // Cálculo do vetor normal para deslocamento lateral
  const dx = t.x - s.x;
  const dy = t.y - s.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / dist;
  const ny = dx / dist;

  const gap = 6; // Espaço entre as linhas da ligação dupla/tripla

  // Função auxiliar para renderizar uma única linha com offset
  const renderLine = (offset: number, key: string) => (
    <Line
      key={key}
      points={[
        s.x + nx * offset,
        s.y + ny * offset,
        t.x + nx * offset,
        t.y + ny * offset,
      ]}
      stroke="#cccccc"
      strokeWidth={4}
      lineCap="round"
      perfectDrawEnabled={false}
    />
  );

  const handleBondClick = () => {
    if (activePaletteElement === "ERASER") {
      removeBond(bond.id);
    } else {
      cycleBondOrder(bond.id);
    }
  };

  return (
    <Group
      onClick={handleBondClick}
      onMouseEnter={(e) => {
        const container = e.target.getStage()?.container();
        if (container) container.style.cursor = "pointer";
      }}
      onMouseLeave={(e) => {
        const container = e.target.getStage()?.container();
        if (container) container.style.cursor = "default";
      }}
    >
      {/* Hitbox para facilitar o clique */}
      <Line
        points={[s.x, s.y, t.x, t.y]}
        stroke="transparent"
        strokeWidth={15}
      />

      {bond.order === BondOrder.SINGLE && renderLine(0, "single")}

      {bond.order === BondOrder.DOUBLE && (
        <>
          {renderLine(gap / 2, "d1")}
          {renderLine(-gap / 2, "d2")}
        </>
      )}

      {bond.order === BondOrder.TRIPLE && (
        <>
          {renderLine(0, "t1")}
          {renderLine(gap, "t2")}
          {renderLine(-gap, "t3")}
        </>
      )}
    </Group>
  );
};
