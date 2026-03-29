// src/components/ElementPalette.tsx
import React from "react";
import { useMoleculeStore } from "../store/useMoleculeStore";
import { ELEMENT_DATA } from "../utils/elements"; // Importamos o dicionário gigante

export const ElementPalette: React.FC = () => {
  const activeElement = useMoleculeStore((state) => state.activePaletteElement);
  const setActiveElement = useMoleculeStore((state) => state.setActiveElement);

  const isGridVisible = useMoleculeStore((state) => state.isGridVisible);
  const toggleGrid = useMoleculeStore((state) => state.toggleGrid);

  // Extraímos todos os símbolos químicos, removendo o fallback 'DEFAULT'
  const elementSymbols = Object.keys(ELEMENT_DATA).filter(
    (el) => el !== "DEFAULT",
  );

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
        width: "80px",
        height: "100vh",
        backgroundColor: "#2c3e50",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "20px",
        paddingBottom: "20px",
        borderRight: "1px solid #34495e",
        zIndex: 100,
        // NOVO: Permite rolar a barra lateral se os itens excederem a tela
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* SEÇÃO DE FERRAMENTAS FIXA NO TOPO (Melhor UX) */}
      <h3
        style={{
          color: "white",
          fontSize: "10px",
          textTransform: "uppercase",
          marginBottom: "10px",
        }}
      >
        Ações
      </h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
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
            flexShrink: 0,
            backgroundColor: isGridVisible ? "#27ae60" : "#7f8c8d", // Verde se visível, cinza se oculta
            border: "none",
            cursor: "pointer",
            fontSize: "20px",
            transition: "all 0.2s",
            boxShadow: isGridVisible ? "0 0 10px #27ae60" : "none",
            color: "white",
            fontWeight: "bold",
            marginTop: "10px",
          }}
        >
          {isGridVisible ? "👁️" : "🙈"}
        </button>
      </div>

      <hr
        style={{
          width: "60%",
          border: "0.5px solid #555",
          margin: "0 0 20px 0",
        }}
      />

      {/* SEÇÃO DE ELEMENTOS */}
      <h3
        style={{
          color: "white",
          fontSize: "10px",
          textTransform: "uppercase",
          marginBottom: "10px",
        }}
      >
        Tabela
      </h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          alignItems: "center",
        }}
      >
        {elementSymbols.map((symbol) => {
          const isSelected = activeElement === symbol;
          const visual = ELEMENT_DATA[symbol];

          return (
            <button
              key={symbol}
              onClick={() => setActiveElement(symbol)}
              title={`Elemento: ${symbol}`}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                flexShrink: 0, // Impede que o botão seja esmagado pelo flexbox
                backgroundColor: visual.color,
                border: isSelected ? "4px solid #f1c40f" : "2px solid white",
                color: visual.textColor,
                fontSize: symbol.length > 1 ? "16px" : "20px", // Ajusta o tamanho da fonte para símbolos de 2 letras
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
      </div>
    </div>
  );
};
