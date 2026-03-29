import React from "react";
import { MoleculeCanvas } from "./canvas/MoleculeCanvas";

function App() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#1e1e1e",
        overflow: "hidden",
      }}
    >
      {/* Um pequeno cabeçalho sobreposto ao canvas */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 10,
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <h2>Construtor Molecular Inorgânico</h2>
        <p style={{ color: "#aaaaaa" }}>
          Arraste o fundo para mover a área de trabalho.
        </p>
      </div>

      {/* O nosso motor gráfico entra aqui */}
      <MoleculeCanvas />
    </div>
  );
}

export default App;
