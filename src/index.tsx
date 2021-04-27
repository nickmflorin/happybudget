import React from "react";
import ReactDOM from "react-dom";
import { LicenseManager } from "@ag-grid-enterprise/core";
import { isNil } from "lodash";

import "style/index.scss";
import App from "./app";
import reportWebVitals from "./lib/operational/reportWebVitals";

import "ag-grid-enterprise";

let agGridKey = process.env.REACT_APP_AG_GRID_KEY;
if (!isNil(agGridKey)) {
  /* eslint-disable no-console */
  console.info("Setting AG Grid License Key");
  LicenseManager.setLicenseKey(agGridKey);
} else {
  /* eslint-disable no-console */
  console.warn("No REACT_APP_AG_GRID_KEY found in environment.  App may not behave as expected.");
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
