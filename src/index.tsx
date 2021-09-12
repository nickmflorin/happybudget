import configureApplication from "./config";

import React from "react";
import ReactDOM from "react-dom";

import "style/index.scss";
import App from "./app";

configureApplication();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
