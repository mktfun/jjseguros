import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { logger } from "./utils/logger";

// Inicializa a blindagem de logs em produção
logger.init();

createRoot(document.getElementById("root")!).render(<App />);
