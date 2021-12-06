declare namespace Events {
  type Id = "rowsAdded";

  type RowsAddedParams = {
    readonly tableId: Table.Id;
    readonly numRows: number;
  }

  type Data<T> = { detail: T }
}
