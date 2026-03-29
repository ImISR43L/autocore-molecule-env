import React, { memo } from "react";
import { Layer, RegularPolygon } from "react-konva";
import { gridInstance, HEX_RADIUS } from "../utils/grid";

export const GridLayer: React.FC = memo(() => {
  return (
    // O listening={false} corta o processamento de eventos de mouse nesta camada inteira
    <Layer listening={false}>
      {gridInstance.toArray().map((hex, i) => (
        <RegularPolygon
          key={`${hex.q}-${hex.r}-${i}`}
          x={hex.x}
          y={hex.y}
          sides={6}
          radius={HEX_RADIUS}
          stroke="#333333"
          strokeWidth={1}
          opacity={0.5}
          perfectDrawEnabled={false} // Otimização visual para o polígono
        />
      ))}
    </Layer>
  );
});
