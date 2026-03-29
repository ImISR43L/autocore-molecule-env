import React, { useEffect, useState } from "react";
import { MoleculeCanvas } from "./canvas/MoleculeCanvas";
import { initRDKit } from "./engine/rdkit";

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Inicializa o motor químico ao montar o componente
    initRDKit().then(() => setIsReady(true));
  }, []);

  if (!isReady) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "#1e1e1e",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
        }}
      >
        <h2>Carregando Motor Químico...</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#1e1e1e",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 10,
          color: "#ffffff",
        }}
      >
        <h2>Construtor Molecular Inorgânico</h2>
        <p style={{ color: "#aaaaaa" }}>RDKit.js Ativado 🧠</p>
      </div>

      <MoleculeCanvas />
    </div>
  );
}

export default App;
