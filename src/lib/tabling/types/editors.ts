import { ICellEditorParams } from "ag-grid-community";

import { store } from "application";

import * as model from "../../model";
import * as columns from "../columns";
import * as events from "../events";
import * as rows from "../rows";

import * as cells from "./cells";
import * as table from "./table";

export interface AgEditorRef<
  R extends rows.Row = rows.Row,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T = cells.CellValue<R, N>,
> {
  // Should return the final value to the grid, the result of the editing
  getValue(): T;
  // Gets called once after initialised.  If you return true, the editor will appear in a popup.
  isPopup?(): boolean;
  /* Gets called once, only if isPopup() returns true. Return "over" if the popup should cover the
     cell, or "under" if it should be positioned below leaving the cell value visible. If this
     method is not present, the default is "over". */
  getPopupPosition?(): string;
  /* Gets called once before editing starts, to give editor a chance to cancel the editing before it
     even starts. */
  isCancelBeforeStart?(): boolean;
  /* Gets called once when editing is finished (eg if Enter is pressed).  If you return true, then
     the result of the edit will be ignored. */
  isCancelAfterEnd?(): boolean;
  // If doing full row edit, then gets called when tabbing into the cell.
  focusIn?(): boolean;
  // If doing full row edit, then gets called when tabbing out of the cell.
  focusOut?(): boolean;
}

export interface EditorProps<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T = cells.CellValue<R, N>,
  C extends table.TableContext = table.TableContext,
  S extends store.TableStore<R> = store.TableStore<R>,
> extends Omit<ICellEditorParams<R, T>, "column"> {
  readonly tableContext: C;
  readonly table: table.TableInstance<R, M>;
  readonly keyPress: number | null;
  readonly charPress: string | null;
  readonly column: columns.BodyColumn<R, M, N, T>;
  readonly columns: columns.DataColumn<R, M, N, T>[];
  readonly data: R;
  readonly rowIndex: number;
  readonly selector: (state: store.ApplicationStore) => S;
  readonly stopEditing: (suppressNavigateAfterEdit?: boolean) => void;
  /*
  When the cell editor finishes editing, the AG Grid callback (onCellDoneEditing) does not have any
  context about what event triggered the completion, so we have to handle that ourselves so we can
  trigger different behaviors depending on how the selection was performed.
  */
  readonly onDoneEditing: (e: events.CellDoneEditingEvent) => void;
}
