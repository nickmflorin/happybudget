import { isNil } from "lodash";

import "ag-grid-enterprise";
import { LicenseManager } from "@ag-grid-enterprise/core";

const configureAgGrid = () => {
  /* eslint-disable no-console */
  console.log("Configuring AG Grid");
  let agGridKey = process.env.REACT_APP_AG_GRID_KEY;
  if (!isNil(agGridKey)) {
    /* eslint-disable no-console */
    console.info("Setting AG Grid License Key");
    LicenseManager.setLicenseKey(agGridKey);
  } else {
    /* eslint-disable no-console */
    console.warn("No REACT_APP_AG_GRID_KEY found in environment.  App may not behave as expected.");
  }
};

export default configureAgGrid;
