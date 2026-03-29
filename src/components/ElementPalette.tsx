// src/components/ElementPalette.tsx
import React, { useState } from "react";
import { useMoleculeStore } from "../store/useMoleculeStore";
import { ELEMENT_DATA, ELEMENT_NAMES } from "../utils/elements"; // Importe o novo dicionário

export const ElementPalette: React.FC = () => {
  const activeElement = useMoleculeStore((state) => state.activePaletteElement);
  const setActiveElement = useMoleculeStore((state) => state.setActiveElement);
  const isGridVisible = useMoleculeStore((state) => state.isGridVisible);
  const toggleGrid = useMoleculeStore((state) => state.toggleGrid);

  // NOVO: Estado para armazenar o texto da busca
  const [searchTerm, setSearchTerm] = useState("");

  const elementSymbols = Object.keys(ELEMENT_DATA).filter(
    (el) => el !== "DEFAULT",
  );

  // NOVO: Filtra os elementos com base na busca (símbolo ou nome completo)
  const filteredSymbols = elementSymbols.filter((symbol) => {
    const search = searchTerm.toLowerCase();
    const name = (ELEMENT_NAMES[symbol] || "").toLowerCase();
    return symbol.toLowerCase().includes(search) || name.includes(search);
  });

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
          flexShrink: 0,
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
        width: "220px", // LARGURA AUMENTADA
        height: "100vh",
        backgroundColor: "#2c3e50",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px 10px",
        boxSizing: "border-box",
        borderRight: "1px solid #34495e",
        zIndex: 100,
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <h3
        style={{
          color: "white",
          fontSize: "12px",
          textTransform: "uppercase",
          marginBottom: "10px",
        }}
      >
        Ferramentas
      </h3>

      {/* Container de Ferramentas organizado em Grid 2x2 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        {renderToolButton("CHARGE_PLUS", "+", "Carga Positiva", "#3498db")}
        {renderToolButton("CHARGE_MINUS", "-", "Carga Negativa", "#e67e22")}
        {renderToolButton("ERASER", "🗑️", "Borracha", "#e74c3c")}
        <button
          onClick={toggleGrid}
          title={isGridVisible ? "Ocultar Grade" : "Mostrar Grade"}
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "8px",
            backgroundColor: isGridVisible ? "#27ae60" : "#7f8c8d",
            border: "none",
            cursor: "pointer",
            fontSize: "20px",
            transition: "all 0.2s",
            boxShadow: isGridVisible ? "0 0 10px #27ae60" : "none",
            color: "white",
          }}
        >
          {isGridVisible ? "👁️" : "🙈"}
        </button>
      </div>

      <hr
        style={{
          width: "80%",
          border: "0.5px solid #555",
          margin: "0 0 15px 0",
        }}
      />

      <h3
        style={{
          color: "white",
          fontSize: "12px",
          textTransform: "uppercase",
          marginBottom: "10px",
        }}
      >
        Elementos
      </h3>

      {/* NOVO: Barra de Busca */}
      <input
        type="text"
        placeholder="Buscar átomo..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "90%",
          padding: "10px",
          marginBottom: "20px",
          borderRadius: "6px",
          border: "none",
          outline: "none",
          backgroundColor: "#34495e",
          color: "white",
          fontSize: "14px",
        }}
      />

      {/* NOVO: Grid de Átomos com 3 colunas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
          width: "100%",
          justifyItems: "center",
        }}
      >
        {filteredSymbols.map((symbol) => {
          const isSelected = activeElement === symbol;
          const visual = ELEMENT_DATA[symbol];
          const fullName = ELEMENT_NAMES[symbol] || symbol;

          return (
            <button
              key={symbol}
              onClick={() => setActiveElement(symbol)}
              title={`${fullName} (${symbol})`}
              style={{
                width: "45px",
                height: "45px",
                borderRadius: "50%",
                backgroundColor: visual.color,
                border: isSelected ? "4px solid #f1c40f" : "2px solid white",
                color: visual.textColor,
                fontSize: symbol.length > 1 ? "14px" : "18px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                transition: "all 0.2s",
                boxShadow: isSelected ? "0 0 10px #f1c40f" : "none",
              }}
            >
              {symbol}
            </button>
          );
        })}
        {filteredSymbols.length === 0 && (
          <span
            style={{ color: "#bdc3c7", fontSize: "12px", gridColumn: "span 3" }}
          >
            Nenhum átomo encontrado.
          </span>
        )}
      </div>
    </div>
  );
};
