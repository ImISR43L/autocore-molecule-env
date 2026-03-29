// src/components/ElementPalette.tsx
import React from "react";
import { useMoleculeStore } from "../store/useMoleculeStore";

// Lista de elementos disponíveis na paleta
const ELEMENTS = [
  { symbol: "Fe", name: "Ferro", color: "#4A90E2" },
  { symbol: "Cl", name: "Cloro", color: "#2ecc71" },
  { symbol: "O", name: "Oxigénio", color: "#e74c3c" },
  { symbol: "H", name: "Hidrogénio", color: "#ecf0f1" },
  { symbol: "C", name: "Carbono", color: "#34495e" },
];

export const ElementPalette: React.FC = () => {
  const activeElement = useMoleculeStore((state) => state.activePaletteElement);
  const setActiveElement = useMoleculeStore((state) => state.setActiveElement);

  const renderToolButton = (
    id: string,
    icon: string,
    title: string,
    bgColor: string,
  ) => {
    const isSelected = activeElement === id;
    return (
      <button
        onClick={() => setActiveElement(id)}
        title={title}
        style={{
          width: "50px",
          height: "50px",
          borderRadius: "8px",
          backgroundColor: isSelected ? bgColor : "#95a5a6",
          border: "none",
          cursor: "pointer",
          fontSize: "20px",
          transition: "all 0.2s",
          boxShadow: isSelected ? `0 0 10px ${bgColor}` : "none",
          color: "white",
          fontWeight: "bold",
        }}
      >
        {icon}
      </button>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "80px",
        height: "100vh",
        backgroundColor: "#2c3e50",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "20px",
        gap: "15px",
        borderRight: "1px solid #34495e",
        zIndex: 100, // Garante que fica por cima do canvas
      }}
    >
      <h3
        style={{ color: "white", fontSize: "12px", textTransform: "uppercase" }}
      >
        Átomos
      </h3>

      {ELEMENTS.map((el) => {
        const isSelected = activeElement === el.symbol;
        return (
          <button
            key={el.symbol}
            onClick={() => setActiveElement(el.symbol)}
            title={el.name}
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: el.color,
              border: isSelected ? "4px solid #f1c40f" : "2px solid white",
              color: el.symbol === "H" ? "#333" : "white", // Contraste para Hidrogénio
              fontSize: "24px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              transition: "all 0.2s",
              boxShadow: isSelected ? "0 0 10px #f1c40f" : "none",
            }}
          >
            {el.symbol}
          </button>
        );
      })}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {renderToolButton("CHARGE_PLUS", "+", "Carga Positiva", "#3498db")}
        {renderToolButton("CHARGE_MINUS", "-", "Carga Negativa", "#e67e22")}
        {renderToolButton("ERASER", "🗑️", "Borracha", "#e74c3c")}
      </div>
    </div>
  );
};
