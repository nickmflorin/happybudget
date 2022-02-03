import { authenticateDataGrid } from "../hocs";
import AuthenticatedGrid, { AuthenticatedGridProps } from "./AuthenticatedGrid";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export default authenticateDataGrid<AuthenticatedGridProps<any, any>, any, any>(AuthenticatedGrid);
