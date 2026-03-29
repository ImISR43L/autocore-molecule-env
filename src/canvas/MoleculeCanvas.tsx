// src/canvas/MoleculeCanvas.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Stage, Layer } from "react-konva";
import { GridLayer } from "./GridLayer";
import { AtomNode } from "./AtomNode";
import { BondLine } from "./BondLine";
import { ElementPalette } from "../components/ElementPalette"; // <-- Importar a Paleta
import { useMoleculeStore } from "../store/useMoleculeStore";
import { gridMath } from "../utils/grid"; // <-- Importar a instância da grade
import { Atom } from "../types/molecule";

export const MoleculeCanvas: React.FC = () => {
  const stageRef = useRef<any>(null); // Referência para o palco do Konva
  const allAtoms = useMoleculeStore((state) => state.atoms);
  const allBonds = useMoleculeStore((state) => state.bonds);

  // 2. Filtramos localmente, apenas quando o estado bruto mudar
  const atoms = useMemo(() => {
    const filtered: Record<string, Atom> = {};
    for (const key in allAtoms) {
      if (allAtoms[key].x === undefined) {
        filtered[key] = allAtoms[key];
      }
    }
    return filtered;
  }, [allAtoms]);

  const bonds = useMemo(() => {
    return allBonds.filter((b) => allAtoms[b.sourceId]?.x === undefined);
  }, [allBonds, allAtoms]);
  const activeElement = useMoleculeStore((state) => state.activePaletteElement); // Ler elemento ativo
  const addAtomToGrid = useMoleculeStore((state) => state.addAtomToGrid); // Ler ação de adicionar
  const isGridVisible = useMoleculeStore((state) => state.isGridVisible);

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth - 220, // ANTES ERA 80
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      // 2. Atualize também dentro do evento de resize:
      setDimensions({
        width: window.innerWidth - 220, // ANTES ERA 80
        height: window.innerHeight,
      });
    };

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
    const clickedHex = gridMath.pointToHex({
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
        style={{
          cursor: activeElement ? "crosshair" : "grab",
          marginLeft: "220px",
        }}
        onClick={handleStageClick}
      >
        {/* SÓ RENDERIZA A GRADE SE ESTIVER ATIVA */}
        {isGridVisible && <GridLayer />}

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
