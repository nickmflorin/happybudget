/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
type RowCells<F> = { [key in F]: ICell<any> };

interface ICell<T = string> {
  value: T;
  error?: string;
}

interface ICellError<F> {
  id: number;
  field: F;
  error: string;
}

interface IRowMeta {
  selected: boolean;
}

interface IRow<F, E extends IRowMeta> {
  id: number;
  meta: E;
  [key in F]: ICell<any>;
}

interface ICellUpdate<F> {
  column: F;
  row: number;
  value: any;
}
