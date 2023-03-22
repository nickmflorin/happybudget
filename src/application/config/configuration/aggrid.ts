import "ag-grid-enterprise";
import { LicenseManager } from "@ag-grid-enterprise/core";

import { logger } from "internal";

export const configure = () => {
  const AG_GRID_KEY = process.env.NEXT_PUBLIC_AG_GRID_KEY;
  if (AG_GRID_KEY === undefined || AG_GRID_KEY.toLowerCase() === "none") {
    logger.warn("No AG_GRID_KEY found in the environment, AG Grid will be used without a license.");
  } else {
    LicenseManager.setLicenseKey(AG_GRID_KEY);
  }
};
