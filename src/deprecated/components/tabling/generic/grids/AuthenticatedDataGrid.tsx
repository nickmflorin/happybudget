import AuthenticatedGrid, { AuthenticatedGridProps } from "./AuthenticatedGrid";
import { authenticateDataGrid } from "../hocs";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export default authenticateDataGrid<AuthenticatedGridProps<any, any>, any, any>(AuthenticatedGrid);
