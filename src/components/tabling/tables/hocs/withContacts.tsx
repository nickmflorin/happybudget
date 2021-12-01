import React, { useMemo } from "react";
import { isNil, find } from "lodash";
import hoistNonReactStatics from "hoist-non-react-statics";

import { tabling, hooks, model } from "lib";

interface InjectedContactsProps<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel> {
  readonly onCellFocusChanged?: (params: Table.CellFocusChangedParams<R, M>) => void;
  readonly columns: Table.Column<R, M>[];
}

export interface WithContactsProps {
  readonly contacts: Model.Contact[];
  readonly onEditContact: (params: { contact: number; id: Table.EditableRowId }) => void;
  readonly onSearchContact: (v: string) => void;
  readonly onNewContact: (params: { name?: string; id: Table.ModelRowId }) => void;
}

export type WithWithContactsProps<
  T,
  R extends Tables.SubAccountRowData | Tables.ActualRowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> = InjectedContactsProps<R, M> & T;

/* eslint-disable indent */
const withContacts =
  <
    R extends Tables.SubAccountRowData | Tables.ActualRowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    T extends WithContactsProps = WithContactsProps
  >(
    columns: Table.Column<R, M>[]
  ) =>
  (
    Component:
      | React.ComponentClass<WithWithContactsProps<T, R, M>, {}>
      | React.FunctionComponent<WithWithContactsProps<T, R, M>>
  ): React.FunctionComponent<T> => {
    function WithContacts(props: T) {
      const processCellFromClipboard = hooks.useDynamicCallback((name: string) => {
        if (name.trim() === "") {
          return null;
        } else {
          const names = model.util.parseFirstAndLastName(name);
          const contact: Model.Contact | undefined = find(props.contacts, {
            first_name: names[0],
            last_name: names[1]
          });
          return contact?.id || null;
        }
      });

      const processCellForClipboard = hooks.useDynamicCallback((row: R) => {
        const id = row.contact;
        if (isNil(id)) {
          return "";
        }
        const m: Model.Contact | undefined = find(props.contacts, { id } as any);
        return m?.full_name || "";
      });

      const processCellForCSV = hooks.useDynamicCallback((row: R) => {
        if (!isNil(row.contact)) {
          const m: Model.Contact | null = model.util.getModelById(props.contacts, row.contact);
          return (!isNil(m) && model.util.contactName(m)) || "";
        }
        return "";
      });

      const cols = useMemo(() => {
        return tabling.columns.normalizeColumns(columns, {
          contact: {
            cellRendererParams: { onEditContact: props.onEditContact },
            cellEditorParams: { onNewContact: props.onNewContact, setSearch: props.onSearchContact },
            processCellForClipboard,
            processCellFromClipboard,
            processCellForCSV
          }
        });
      }, [
        processCellForClipboard,
        processCellFromClipboard,
        processCellForCSV,
        props.onEditContact,
        props.onNewContact,
        props.onSearchContact,
        hooks.useDeepEqualMemo(props.contacts)
      ]);

      return (
        <Component
          {...props}
          columns={cols}
          onCellFocusChanged={(params: Table.CellFocusChangedParams<R, M>) => {
            /*
            For the ContactCell, we want the contact tag in the cell to be clickable
            only when the cell is focused.  This means we have to rerender the cell when
            it becomes focused or unfocused so that the tag becomes clickable (in the focused
            case) or unclickable (in the unfocused case).
            */
            const rowNodes: Table.RowNode[] = [];
            if (params.cell.column.field === "contact") {
              rowNodes.push(params.cell.rowNode);
            }
            if (!isNil(params.previousCell) && params.previousCell.column.field === "contact") {
              rowNodes.push(params.previousCell.rowNode);
            }
            if (rowNodes.length !== 0) {
              params.apis.grid.refreshCells({
                force: true,
                rowNodes,
                columns: ["contact"]
              });
            }
          }}
        />
      );
    }
    return hoistNonReactStatics(WithContacts, Component);
  };

export default withContacts;
