import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

import { UserContextProvider } from './context/userContext';
import { OrderContextProvider } from './context/orderContext';

ReactDOM.render(
  <UserContextProvider>
  <OrderContextProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </OrderContextProvider>
  </UserContextProvider>,
  document.getElementById("root")
);
