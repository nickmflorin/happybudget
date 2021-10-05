export const isSubAccountRow = (r: Table.DataRow<any>): r is Table.DataRow<Tables.SubAccountRowData> =>
  (r.data as Tables.SubAccountRowData).fringe_contribution !== undefined;
