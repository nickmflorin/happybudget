import { isNil } from "lodash";

import "ag-grid-enterprise";
import { LicenseManager } from "@ag-grid-enterprise/core";

import * as env from "./env";

const configureAgGrid = () => {
  if (!isNil(env.AG_GRID_KEY)) {
    LicenseManager.setLicenseKey(env.AG_GRID_KEY);
  }
};

export default configureAgGrid;
