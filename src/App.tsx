import { MoleculeCanvas } from "./canvas/MoleculeCanvas";
import { OrganicCanvas } from "./canvas/OrganicCanvas"; // Importe o novo canvas
import { useMoleculeStore } from "./store/useMoleculeStore";
import { ElementPalette } from "./components/ElementPalette";

function App() {
  const mode = useMoleculeStore((state) => state.mode);
  const setMode = useMoleculeStore((state) => state.setMode);

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
          left: "240px", // Respeitando a barra lateral de 220px + 20px de margem
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
