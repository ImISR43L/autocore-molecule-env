import React from "react";
import { Group, Circle, Text } from "react-konva";
import { CustomHex, HEX_RADIUS, gridInstance } from "../utils/grid";
import type { Atom } from "../types/molecule";
import { useMoleculeStore } from "../store/useMoleculeStore";
import { ELEMENT_DATA } from "../utils/elements";

interface AtomNodeProps {
  atom: Atom;
}

// O memo impede que os átomos parados percam FPS quando você arrasta um vizinho
export const AtomNode: React.FC<AtomNodeProps> = React.memo(({ atom }) => {
  const {
    updateAtomPosition,
    selectAtom,
    removeAtom,
    modifyAtomCharge,
    activePaletteElement,
  } = useMoleculeStore();
  const isSelected = useMoleculeStore(
    (state) => state.selectedAtomId === atom.id,
  );

  // A posição visual é 100% amarrada à lógica do Zustand
  const hex = new CustomHex({ q: atom.gridPosition.q, r: atom.gridPosition.r });

  const visualData = ELEMENT_DATA[atom.element] || ELEMENT_DATA.DEFAULT;
  const atomRadius = HEX_RADIUS * 0.6 * visualData.radiusScale;

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
    } else if (activePaletteElement === "CHARGE_PLUS") {
      modifyAtomCharge(atom.id, 1);
    } else if (activePaletteElement === "CHARGE_MINUS") {
      modifyAtomCharge(atom.id, -1);
    } else {
      selectAtom(atom.id);
    }
  };

  // Formatar a string da carga (ex: 1 -> "+", -1 -> "-", 2 -> "+2")
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
      {/* Sombra/Glow de seleção */}
      {isSelected && (
        <Circle
          radius={atomRadius + 4}
          fill="transparent"
          stroke="#f1c40f"
          strokeWidth={3}
          opacity={0.8}
        />
      )}

      {/* Corpo do Átomo */}
      <Circle
        radius={atomRadius}
        fill={visualData.color}
        stroke="#ffffff"
        strokeWidth={1.5}
        perfectDrawEnabled={false}
      />

      {/* Símbolo do Elemento */}
      <Text
        text={atom.element}
        fontSize={20 * visualData.radiusScale}
        fontFamily="sans-serif"
        fontStyle="bold"
        fill={visualData.textColor}
        // CORREÇÃO: Definimos o tamanho da caixa igual ao diâmetro do átomo
        width={atomRadius * 2}
        height={atomRadius * 2}
        // Movemos a caixa para começar no canto superior esquerdo do círculo
        x={-atomRadius}
        y={-atomRadius}
        // Alinhamento horizontal e vertical automáticos do Konva
        align="center"
        verticalAlign="middle"
        listening={false}
      />

      {/* Bolha de Carga Formal (renderizada apenas se a carga for diferente de 0) */}
      {atom.charge !== 0 && (
        <Group x={atomRadius * 0.7} y={-atomRadius * 0.7} listening={false}>
          <Circle radius={10} fill="#ffffff" stroke="#333333" strokeWidth={1} />
          <Text
            text={formatCharge(atom.charge)}
            fontSize={12}
            fontStyle="bold"
            fill="#333333"
            align="center"
            verticalAlign="middle"
            offsetX={formatCharge(atom.charge).length > 1 ? 6 : 4} // Ajustar centro baseado no tamanho do texto
            offsetY={6}
          />
        </Group>
      )}
    </Group>
  );
});
