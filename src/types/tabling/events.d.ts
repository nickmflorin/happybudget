/* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
namespace Events {
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type Id = "rowsAdded";

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type RowsAddedParams = {
    readonly tableId: Table.Id;
    readonly numRows: number;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type Data<T> = { detail: T }
}
