declare namespace Table {
  type Name = "account-subaccounts" | "accounts" | "subaccount-subaccounts" | "fringes" | "actuals" | "contacts";
  type AsyncId = `async-${Name}-table`;

  type AgGridProps = import("@ag-grid-community/react/lib/interfaces").AgGridReactProps;

  type GridOptions = import("@ag-grid-community/core").GridOptions;

  type TableOptionsSet = GridSet<import("@ag-grid-community/core").GridOptions>;

  type GeneralClassName = string | undefined | null;

  type RowNode = import("@ag-grid-community/core").RowNode;

  type MenuItemDef = import("@ag-grid-community/core").MenuItemDef | string;

  type GridReadyEvent = import("@ag-grid-community/core").GridReadyEvent;

  type FirstDataRenderedEvent = import("@ag-grid-community/core").FirstDataRenderedEvent;

  type CreateTableDataConfig<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly response: Http.TableResponse<M>;
    readonly columns: Column<R, M>[];
    readonly getModelRowChildren?: (m: M) => number[];
  };

  type RawClassName = string | string[] | undefined | { [key: string]: boolean };

  type ClassNameParamCallback<T> = (params: T) => ClassName<T>;

  interface _CellClassNameArray<P> {
    [n: number]: RawClassName | ClassNameParamCallback<P>;
  }

  type ClassName<P> = RawClassName | ClassNameParamCallback<P> | _CellClassNameArray<P>;
}
