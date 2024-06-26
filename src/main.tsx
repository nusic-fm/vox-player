import { ThemeProvider } from "@mui/material/styles";
import React, { createContext, useContext } from "react";
import ReactDOM from "react-dom/client";
// import App from "./App";
import "./index.css";
import theme from "./theme";
import {
  createBrowserRouter,
  // createHashRouter,
  RouterProvider,
  // Route,
  // Link,
} from "react-router-dom";
import App from "./App";
import GlobalStateProvider from "./components/providers/GlobalStateProvider";
import Admin from "./Admin";

export const GlobalStateContext = createContext<any>(null);

export const useGlobalState = () => useContext(GlobalStateContext);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/admin",
    element: <Admin />,
  },
]);
const AppWithRouter = () => (
  <GlobalStateProvider>
    <RouterProvider router={router} />
  </GlobalStateProvider>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <AppWithRouter />
    </ThemeProvider>
  </React.StrictMode>
);
