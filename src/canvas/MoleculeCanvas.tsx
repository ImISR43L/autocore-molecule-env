import React, { useState, useEffect } from "react";
import { Stage, Layer } from "react-konva";
import { GridLayer } from "./GridLayer";
import { AtomNode } from "./AtomNode";
import { BondLine } from "./BondLine";
import { useMoleculeStore } from "../store/useMoleculeStore";

export const MoleculeCanvas: React.FC = () => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // 1. Lemos os átomos e a função de adicionar do Zustand
  const atoms = useMoleculeStore((state) => state.atoms);
  const bonds = useMoleculeStore((state) => state.bonds);
  const addAtom = useMoleculeStore((state) => state.addAtom);

  useEffect(() => {
    const handleResize = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 20,
          zIndex: 10,
          display: "flex",
          gap: "10px",
        }}
      >
        <button
          onClick={() => addAtom("Fe", 5, 5)}
          style={{ padding: "8px 16px", cursor: "pointer" }}
        >
          + Add Ferro
        </button>
        <button
          onClick={() => addAtom("Cl", 7, 5)}
          style={{ padding: "8px 16px", cursor: "pointer" }}
        >
          + Add Cloro
        </button>
      </div>

      <Stage width={dimensions.width} height={dimensions.height}>
        <GridLayer />

        {/* Camada 2: Ligações (Desenhadas por baixo dos átomos) */}
        <Layer>
          {bonds.map((bond) => (
            <BondLine key={bond.id} bond={bond} />
          ))}
        </Layer>

        {/* Camada 3: Átomos */}
        <Layer>
          {Object.values(atoms).map((atom) => (
            <AtomNode key={atom.id} atom={atom} />
          ))}
        </Layer>
      </Stage>
    </>
  );
};
