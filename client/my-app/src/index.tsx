import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./Components/Auth/AuthProvider";

// Find the root of your app
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

// Render the App component instead of Home
root.render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
  </React.StrictMode>,
);

// Call the function to report web vitals
reportWebVitals();
