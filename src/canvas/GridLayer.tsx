// Exemplo de como deve ficar o seu src/canvas/GridLayer.tsx (ou similar)

import React, { useState, useEffect } from "react";
import { Layer, RegularPolygon } from "react-konva";
import { getVisualGrid, HEX_RADIUS } from "../utils/grid";

export const GridLayer: React.FC = () => {
  const [grid, setGrid] = useState(() =>
    getVisualGrid(window.innerWidth - 80, window.innerHeight),
  );

  useEffect(() => {
    const handleResize = () => {
      setGrid(getVisualGrid(window.innerWidth - 80, window.innerHeight));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Layer listening={false}>
      {grid.toArray().map((hex, i) => (
        <RegularPolygon
          key={i}
          x={hex.x}
          y={hex.y}
          sides={6}
          radius={HEX_RADIUS}
          stroke="#444444"
          strokeWidth={1}
        />
      ))}
    </Layer>
  );
};
