/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Events {
  type Id = "rowsAdded";

  type RowsAddedParams = {
    readonly tableId: Table.Id;
    readonly numRows: number;
  }

  type Data<T> = { detail: T }
}
