import PublicGrid, { PublicGridProps } from "./PublicGrid";
import { publicizeDataGrid } from "../hocs";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export default publicizeDataGrid<PublicGridProps<any, any>, any, any>(PublicGrid);
