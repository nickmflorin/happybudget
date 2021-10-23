import { isNil } from "lodash";

import "ag-grid-enterprise";
import { LicenseManager } from "@ag-grid-enterprise/core";

const configureAgGrid = () => {
  console.info("Configuring AG Grid");
  let agGridKey = process.env.REACT_APP_AG_GRID_KEY;
  if (!isNil(agGridKey)) {
    console.info("Setting AG Grid License Key");
    LicenseManager.setLicenseKey(agGridKey);
  } else {
    console.warn("No REACT_APP_AG_GRID_KEY found in environment.  App may not behave as expected.");
  }
};

export default configureAgGrid;
