// src/components/ElementPalette.tsx
import React, { useState } from "react";
import { useMoleculeStore } from "../store/useMoleculeStore";
import { ELEMENT_DATA, ELEMENT_NAMES } from "../utils/elements";

export const ElementPalette: React.FC = () => {
  const mode = useMoleculeStore((state) => state.mode); // NOVO: Lemos o modo atual
  const activeElement = useMoleculeStore((state) => state.activePaletteElement);
  const setActiveElement = useMoleculeStore((state) => state.setActiveElement);
  const isGridVisible = useMoleculeStore((state) => state.isGridVisible);
  const toggleGrid = useMoleculeStore((state) => state.toggleGrid);

  const [searchTerm, setSearchTerm] = useState("");

  // --- LÓGICA DO MODO INORGÂNICO ---
  const elementSymbols = Object.keys(ELEMENT_DATA).filter(
    (el) => el !== "DEFAULT",
  );
  const filteredSymbols = elementSymbols.filter((symbol) => {
    const search = searchTerm.toLowerCase();
    const name = (ELEMENT_NAMES[symbol] || "").toLowerCase();
    return symbol.toLowerCase().includes(search) || name.includes(search);
  });

  // --- LÓGICA DO MODO ORGÂNICO ---
  const organicHeteroatoms = ["C", "O", "N", "S", "P", "F", "Cl", "Br", "I"];
  const organicBonds = [
    { id: "BOND_SINGLE", icon: "╱", title: "Ligação Simples" },
    { id: "BOND_DOUBLE", icon: "═", title: "Ligação Dupla" },
    { id: "BOND_TRIPLE", icon: "≡", title: "Ligação Tripla" },
    { id: "BOND_WEDGE", icon: "◤", title: "Cunha (Frente)" },
    { id: "BOND_DASH", icon: "▤", title: "Traço (Trás)" },
  ];
  const organicRings = [
    { id: "RING_BENZENE", icon: "⬡", title: "Benzeno" },
    { id: "RING_CYCLOHEXANE", icon: "⬡", title: "Ciclohexano" },
    { id: "RING_CYCLOPENTANE", icon: "⬠", title: "Ciclopentano" },
  ];

  // Helper para desenhar botões genéricos
  const renderToolButton = (
    id: string,
    icon: string,
    title: string,
    bgColor: string = "#95a5a6",
    fontSize: string = "20px",
  ) => {
    const isSelected = activeElement === id;
    return (
      <button
        key={id}
        onClick={() => setActiveElement(id)}
        title={title}
        style={{
          width: "50px",
          height: "50px",
          borderRadius: "8px",
          flexShrink: 0,
          backgroundColor: isSelected ? bgColor : "#34495e",
          border: isSelected ? `2px solid ${bgColor}` : "2px solid transparent",
          cursor: "pointer",
          fontSize: fontSize,
          transition: "all 0.2s",
          boxShadow: isSelected ? `0 0 10px ${bgColor}` : "none",
          color: "white",
          fontWeight: "bold",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {icon}
      </button>
    );
  };

  // Helper para desenhar botões de átomos
  const renderAtomButton = (symbol: string) => {
    const isSelected = activeElement === symbol;
    const visual = ELEMENT_DATA[symbol] || ELEMENT_DATA["DEFAULT"];
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
  };

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "220px",
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
      {/* SEÇÃO COMUM A AMBOS OS MODOS */}
      <h3
        style={{
          color: "white",
          fontSize: "12px",
          textTransform: "uppercase",
          marginBottom: "10px",
        }}
      >
        Ações
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          marginBottom: "20px",
          width: "100%",
          padding: "0 10px",
          boxSizing: "border-box",
        }}
      >
        {renderToolButton("CHARGE_PLUS", "+", "Carga Positiva", "#3498db")}
        {renderToolButton("CHARGE_MINUS", "-", "Carga Negativa", "#e67e22")}
        {renderToolButton("ERASER", "🗑️", "Borracha", "#e74c3c")}

        {/* O botão da grade só faz sentido no modo inorgânico, mas podemos deixá-lo cinza no orgânico */}
        <button
          onClick={toggleGrid}
          disabled={mode === "ORGANIC"}
          title={
            mode === "ORGANIC"
              ? "Grade desativada no modo orgânico"
              : isGridVisible
                ? "Ocultar Grade"
                : "Mostrar Grade"
          }
          style={{
            width: "100%",
            height: "50px",
            borderRadius: "8px",
            backgroundColor:
              mode === "ORGANIC"
                ? "#555"
                : isGridVisible
                  ? "#27ae60"
                  : "#7f8c8d",
            border: "none",
            cursor: mode === "ORGANIC" ? "not-allowed" : "pointer",
            fontSize: "20px",
            color: "white",
            opacity: mode === "ORGANIC" ? 0.5 : 1,
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

      {/* RENDERIZAÇÃO CONDICIONAL BASEADA NO MODO */}
      {mode === "INORGANIC" ? (
        <>
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              width: "100%",
              justifyItems: "center",
            }}
          >
            {filteredSymbols.map(renderAtomButton)}
            {filteredSymbols.length === 0 && (
              <span
                style={{
                  color: "#bdc3c7",
                  fontSize: "12px",
                  gridColumn: "span 3",
                }}
              >
                Nenhum encontrado.
              </span>
            )}
          </div>
        </>
      ) : (
        <>
          <h3
            style={{
              color: "white",
              fontSize: "12px",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Ligações
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "10px",
              marginBottom: "20px",
              width: "100%",
              padding: "0 5px",
              boxSizing: "border-box",
            }}
          >
            {organicBonds.map((b) =>
              renderToolButton(b.id, b.icon, b.title, "#8e44ad", "24px"),
            )}
          </div>

          <h3
            style={{
              color: "white",
              fontSize: "12px",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Anéis
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "10px",
              marginBottom: "20px",
              width: "100%",
              padding: "0 5px",
              boxSizing: "border-box",
            }}
          >
            {organicRings.map((r) =>
              renderToolButton(r.id, r.icon, r.title, "#f39c12", "28px"),
            )}
          </div>

          <h3
            style={{
              color: "white",
              fontSize: "12px",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Heteroátomos
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              width: "100%",
              justifyItems: "center",
            }}
          >
            {organicHeteroatoms.map(renderAtomButton)}
          </div>
        </>
      )}
    </div>
  );
};
