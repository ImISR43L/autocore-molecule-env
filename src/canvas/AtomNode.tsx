import React from "react";
import { Group, Circle, Text } from "react-konva";
import { CustomHex, HEX_RADIUS, gridInstance } from "../utils/grid";
import type { Atom } from "../types/molecule";
import { useMoleculeStore } from "../store/useMoleculeStore";

interface AtomNodeProps {
  atom: Atom;
}

// O memo impede que os átomos parados percam FPS quando você arrasta um vizinho
export const AtomNode: React.FC<AtomNodeProps> = React.memo(({ atom }) => {
  const updateAtomPosition = useMoleculeStore(
    (state) => state.updateAtomPosition,
  );
  const selectAtom = useMoleculeStore((state) => state.selectAtom);
  const removeAtom = useMoleculeStore((state) => state.removeAtom); // Importar ação
  const activePaletteElement = useMoleculeStore(
    (state) => state.activePaletteElement,
  );
  const isSelected = useMoleculeStore(
    (state) => state.selectedAtomId === atom.id,
  );

  // A posição visual é 100% amarrada à lógica do Zustand
  const hex = new CustomHex({ q: atom.gridPosition.q, r: atom.gridPosition.r });

  const handleDragEnd = (e: any) => {
    const dropX = e.target.x();
    const dropY = e.target.y();
    const targetHex = gridInstance.pointToHex({ x: dropX, y: dropY });

    // Pega todos os átomos atuais para verificar colisão
    const atoms = useMoleculeStore.getState().atoms;

    // Verifica se a casa de destino já tem um dono (ignorando a si mesmo)
    const hasOverlap =
      targetHex &&
      Object.values(atoms).some(
        (a) =>
          a.id !== atom.id &&
          a.gridPosition.q === targetHex.q &&
          a.gridPosition.r === targetHex.r,
      );

    if (targetHex && !hasOverlap) {
      // Movimento Válido!
      e.target.x(targetHex.x);
      e.target.y(targetHex.y);
      updateAtomPosition(atom.id, targetHex.q, targetHex.r);
    } else {
      // Movimento Inválido (Ocupado ou Fora da tela). O átomo sofre um "Elástico" e volta.
      e.target.x(hex.x);
      e.target.y(hex.y);
    }
  };

  const handleClick = () => {
    if (activePaletteElement === "ERASER") {
      removeAtom(atom.id);
    } else {
      selectAtom(atom.id);
    }
  };

  return (
    <Group
      x={hex.x}
      y={hex.y}
      draggable
      onDragEnd={handleDragEnd}
      onMouseEnter={(e) => {
        const container = e.target.getStage()?.container();
        if (container) container.style.cursor = "grab";
      }}
      onMouseLeave={(e) => {
        const container = e.target.getStage()?.container();
        if (container) container.style.cursor = "default";
      }}
      onClick={handleClick}
    >
      <Circle
        radius={HEX_RADIUS * 0.6}
        fill={atom.element === "Fe" ? "#4A90E2" : "#2ecc71"}
        stroke={isSelected ? "#f1c40f" : "#ffffff"}
        strokeWidth={2}
        perfectDrawEnabled={false} // Desliga cálculos caros de borda durante o arraste
        transformsEnabled="position" // Diz ao Konva para não calcular rotação ou escala neste círculo
        opacity={activePaletteElement === "ERASER" ? 0.8 : 1}
      />

      <Text
        text={atom.element}
        fontSize={20}
        fontFamily="sans-serif"
        fontStyle="bold"
        fill="white"
        align="center"
        verticalAlign="middle"
        offsetX={12}
        offsetY={10}
        listening={false}
        perfectDrawEnabled={false}
      />
    </Group>
  );
});
