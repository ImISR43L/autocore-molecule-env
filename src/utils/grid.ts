// src/utils/grid.ts
import { defineHex, Grid, rectangle, Orientation } from "honeycomb-grid";

export const HEX_RADIUS = 40;

export class CustomHex extends defineHex({
  dimensions: HEX_RADIUS,
  orientation: Orientation.POINTY,
}) {}

// Exportamos uma instância da grelha para usarmos em cálculos matemáticos
export const gridInstance = new Grid(
  CustomHex,
  rectangle({ width: 20, height: 15 }),
);
