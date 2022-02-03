import { publicizeDataGrid } from "../hocs";
import PublicGrid, { PublicGridProps } from "./PublicGrid";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export default publicizeDataGrid<PublicGridProps<any, any>, any, any>(PublicGrid);
