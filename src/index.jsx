import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { FormationsProvider } from "./context/FormationsContext";
import { ActualitesProvider } from "./context/ActualitesContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <FormationsProvider>
        <ActualitesProvider>
          <App />
        </ActualitesProvider>
      </FormationsProvider>
    </AuthProvider>
  </React.StrictMode>
);
