// src/canvas/MoleculeCanvas.tsx
import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer } from "react-konva";
import { GridLayer } from "./GridLayer";
import { AtomNode } from "./AtomNode";
import { BondLine } from "./BondLine";
import { ElementPalette } from "../components/ElementPalette"; // <-- Importar a Paleta
import { useMoleculeStore } from "../store/useMoleculeStore";
import { gridInstance } from "../utils/grid"; // <-- Importar a instância da grade

export const MoleculeCanvas: React.FC = () => {
  const stageRef = useRef<any>(null); // Referência para o palco do Konva
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const atoms = useMoleculeStore((state) => state.atoms);
  const bonds = useMoleculeStore((state) => state.bonds);
  const activeElement = useMoleculeStore((state) => state.activePaletteElement); // Ler elemento ativo
  const addAtomToGrid = useMoleculeStore((state) => state.addAtomToGrid); // Ler ação de adicionar

  useEffect(() => {
    const handleResize = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Função para detetar clique na grade vazia
  const handleStageClick = (e: any) => {
    // Se não houver elemento selecionado na paleta, não faz nada
    if (!activeElement) return;

    // Se clicou num átomo existente (não na grade vazia), não adiciona um novo
    if (e.target !== stageRef.current && e.target.name() !== "grid-polygon") {
      return;
    }

    const stage = stageRef.current;
    if (!stage) return;

    // Pega a posição relativa do clique dentro do palco do Konva
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;

    // A MATEMÁTICA DO HONEYCOMB: Converte píxeis de volta para coordenadas hexagonais (q, r)
    const clickedHex = gridInstance.pointToHex({
      x: pointerPosition.x,
      y: pointerPosition.y,
    });

    if (clickedHex) {
      // Adiciona o átomo na grade!
      addAtomToGrid(clickedHex.q, clickedHex.r);
    }
  };

  return (
    <>
      {/* 1. Barra Lateral de Elementos */}
      <ElementPalette />

      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        // Configurar o cursor dependendo se algo está selecionado
        style={{
          cursor: activeElement ? "crosshair" : "grab",
          marginLeft: "80px", // Dá espaço para a paleta
        }}
        onClick={handleStageClick} // Captura cliques no palco
      >
        <GridLayer />

        <Layer>
          {bonds.map((bond) => (
            <BondLine key={bond.id} bond={bond} />
          ))}
        </Layer>

        <Layer>
          {Object.values(atoms).map((atom) => (
            <AtomNode key={atom.id} atom={atom} />
          ))}
        </Layer>
      </Stage>
    </>
  );
};
