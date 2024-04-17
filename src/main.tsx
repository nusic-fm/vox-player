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
import VoxPlayer from "./App";
import GlobalStateProvider from "./components/providers/GlobalStateProvider";

export const GlobalStateContext = createContext<any>(null);

export const useGlobalState = () => useContext(GlobalStateContext);

const router = createBrowserRouter([
  {
    path: "/",
    element: <VoxPlayer />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStateProvider>
        <RouterProvider router={router} />
      </GlobalStateProvider>
    </ThemeProvider>
  </React.StrictMode>
);
