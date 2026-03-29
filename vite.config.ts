import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Importante para evitar problemas de carregamento de módulos pesados
  optimizeDeps: {
    exclude: ["@rdkit/rdkit"],
  },
});
