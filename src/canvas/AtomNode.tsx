// src/canvas/AtomNode.tsx
import React from "react";
import { Group, Circle, Text } from "react-konva";
import { CustomHex, HEX_RADIUS, gridInstance } from "../utils/grid";
import { AtomNodeProps } from "../types/molecule";
import { useMoleculeStore } from "../store/useMoleculeStore";
import { ELEMENT_DATA } from "../utils/elements";

export const AtomNode: React.FC<AtomNodeProps> = React.memo(({ atom }) => {
  const {
    updateAtomPosition,
    selectAtom,
    removeAtom,
    modifyAtomCharge,
    activePaletteElement,
    selectedAtomId,
  } = useMoleculeStore();

  const isSelected = selectedAtomId === atom.id;
  const hex = new CustomHex({ q: atom.gridPosition.q, r: atom.gridPosition.r });

  // Pega a cor oficial ou o padrão se não existir
  const visualData = ELEMENT_DATA[atom.element] || ELEMENT_DATA.DEFAULT;

  // CORREÇÃO: Raio fixo para todos os átomos, sem escala
  const atomRadius = HEX_RADIUS * 0.6;

  const handleDragEnd = (e: any) => {
    // 1. Pega a posição em píxeis onde o mouse soltou
    const dropPixelPos = { x: e.target.x(), y: e.target.y() };

    // 2. Descobre qual é o hexágono lógico em baixo do mouse
    const targetHex = gridInstance.pointToHex(dropPixelPos);

    if (targetHex) {
      // 3. Atualiza a memória lógica (Zustand)
      updateAtomPosition(atom.id, targetHex.q, targetHex.r);

      // CORREÇÃO: Força o elemento visual do Konva a pular (snap) para o centro exato
      const center = new CustomHex(targetHex);
      e.target.position({ x: center.x, y: center.y });
    }
  };

  const handleClick = () => {
    if (activePaletteElement === "ERASER") removeAtom(atom.id);
    else if (activePaletteElement === "CHARGE_PLUS")
      modifyAtomCharge(atom.id, 1);
    else if (activePaletteElement === "CHARGE_MINUS")
      modifyAtomCharge(atom.id, -1);
    else selectAtom(atom.id);
  };

  const formatCharge = (charge: number) => {
    if (charge === 0) return "";
    if (charge === 1) return "+";
    if (charge === -1) return "-";
    return charge > 0 ? `+${charge}` : `${charge}`;
  };

  return (
    <Group
      x={hex.x}
      y={hex.y}
      draggable
      onDragEnd={handleDragEnd}
      onClick={handleClick}
    >
      {isSelected && (
        <Circle
          radius={atomRadius + 4}
          fill="transparent"
          stroke="#f1c40f"
          strokeWidth={3}
          opacity={0.8}
        />
      )}

      {/* Corpo do Átomo agora sempre com cor correta e mesmo tamanho */}
      <Circle
        radius={atomRadius}
        fill={visualData.color}
        stroke="#ffffff"
        strokeWidth={1.5}
        perfectDrawEnabled={false}
      />

      {/* Texto perfeitamente centralizado sem depender da escala */}
      <Text
        text={atom.element}
        fontSize={20}
        fontFamily="sans-serif"
        fontStyle="bold"
        fill={visualData.textColor}
        width={atomRadius * 2}
        height={atomRadius * 2}
        x={-atomRadius}
        y={-atomRadius}
        align="center"
        verticalAlign="middle"
        listening={false}
      />

      {atom.charge !== 0 && (
        <Group x={atomRadius * 0.7} y={-atomRadius * 0.7} listening={false}>
          <Circle radius={10} fill="#ffffff" stroke="#333333" strokeWidth={1} />
          <Text
            text={formatCharge(atom.charge)}
            fontSize={12}
            fontStyle="bold"
            fill="#333333"
            width={20}
            height={20}
            x={-10}
            y={-10}
            align="center"
            verticalAlign="middle"
          />
        </Group>
      )}
    </Group>
  );
});
