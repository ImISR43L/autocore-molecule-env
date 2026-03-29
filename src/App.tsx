// src/App.tsx
import React, { useEffect, useState } from "react";
import { MoleculeCanvas } from "./canvas/MoleculeCanvas";
import { OrganicCanvas } from "./canvas/OrganicCanvas";
import { useMoleculeStore } from "./store/useMoleculeStore";
import { ElementPalette } from "./components/ElementPalette";
import { initRDKit } from "./engine/rdkit"; // Importamos a função de inicialização

function App() {
  const mode = useMoleculeStore((state) => state.mode);
  const setMode = useMoleculeStore((state) => state.setMode);

  // NOVO: Estado para controlar se o motor WASM já carregou
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);

  // NOVO: Efeito que arranca o RDKit assim que a App monta
  useEffect(() => {
    const startEngine = async () => {
      try {
        await initRDKit();
        setIsEngineReady(true);
      } catch (error) {
        console.error("Falha ao arrancar o motor:", error);
        setEngineError("Não foi possível carregar o motor de química.");
      }
    };

    startEngine();
  }, []);

  // NOVO: Ecrã de erro caso o WASM falhe a carregar
  if (engineError) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "#1e272e",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h2>{engineError}</h2>
      </div>
    );
  }

  // NOVO: Ecrã de Loading enquanto o WASM não estiver pronto
  if (!isEngineReady) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "#1e272e",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h2 style={{ fontFamily: "sans-serif" }}>
          Inicializando Motor Autocore...
        </h2>
        <p style={{ color: "#bdc3c7" }}>
          Carregando módulos de química estrutural
        </p>
      </div>
    );
  }

  // O resto da sua App mantém-se igual! O utilizador só chega aqui quando o RDKit já existe na memória.
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#1e272e",
      }}
    >
      <ElementPalette />
      {/* Cabeçalho com Título e Chave de Seleção */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "240px",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: "30px",
        }}
      >
        <h1
          style={{
            color: "white",
            margin: 0,
            fontSize: "24px",
            fontFamily: "sans-serif",
          }}
        >
          Autocore
        </h1>

        {/* O Toggle Switch */}
        <div
          style={{
            display: "flex",
            backgroundColor: "#34495e",
            borderRadius: "20px",
            padding: "4px",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          <button
            onClick={() => setMode("INORGANIC")}
            style={{
              padding: "8px 16px",
              borderRadius: "16px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
              transition: "all 0.3s",
              backgroundColor: mode === "INORGANIC" ? "#3498db" : "transparent",
              color: mode === "INORGANIC" ? "#ffffff" : "#bdc3c7",
              boxShadow:
                mode === "INORGANIC" ? "0 2px 5px rgba(0,0,0,0.2)" : "none",
            }}
          >
            Inorgânica (Grade)
          </button>
          <button
            onClick={() => setMode("ORGANIC")}
            style={{
              padding: "8px 16px",
              borderRadius: "16px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
              transition: "all 0.3s",
              backgroundColor: mode === "ORGANIC" ? "#2ecc71" : "transparent",
              color: mode === "ORGANIC" ? "#ffffff" : "#bdc3c7",
              boxShadow:
                mode === "ORGANIC" ? "0 2px 5px rgba(0,0,0,0.2)" : "none",
            }}
          >
            Orgânica (Esqueleto)
          </button>
        </div>
      </div>

      {/* Renderização Condicional do Canvas */}
      {mode === "INORGANIC" ? <MoleculeCanvas /> : <OrganicCanvas />}
    </div>
  );
}

export default App;
