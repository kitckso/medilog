import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import "./index.css";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* attribute="class" pairs with the `.dark` block in index.css and the
        no-flash inline script in index.html. */}
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </ThemeProvider>
  </StrictMode>,
);
