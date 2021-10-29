import { useMemo } from "react";
import { find, isNil } from "lodash";
import classNames from "classnames";

import { Tag } from "components/tagging";
import { useContacts, useContactsLoaded } from "store/hooks";

import { Cell } from "./generic";

interface ContactCellProps<
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> extends Table.CellProps<R, M, S, number | null> {
  readonly onEditContact: (params: { contact: number; id: Table.EditableRowId }) => void;
}

/* eslint-disable indent */
const ContactCell = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>({
  value,
  ...props
}: ContactCellProps<R, M, S>): JSX.Element => {
  const row: Table.EditableRow<R> = props.node.data;
  const contacts = useContacts();
  const loaded = useContactsLoaded();

  const model = useMemo(() => {
    if (!isNil(value)) {
      const c: Model.Contact | undefined = find(contacts, { id: value } as any);
      if (isNil(c)) {
        if (loaded === true) {
          console.error(`Could not find contact ${value} in store.`);
        }
        return null;
      }
      return c;
    }
    return null;
  }, [value, contacts, loaded]);

  // TODO: This is a very, very render intensive piece of logic.  We should figure out if there
  // is a better way to do this that doesn't involve getting the focused cell on every render.
  let isFocused = false;
  const focusedCell = props.api.getFocusedCell();
  if (!isNil(focusedCell)) {
    if (focusedCell.column === props.column && focusedCell.rowIndex === props.rowIndex) {
      isFocused = true;
    }
  }
  return (
    <Cell {...props}>
      <div style={{ display: "flex", justifyContent: "left" }}>
        {!isNil(model) ? (
          <Tag
            className={classNames("tag--contact", { focused: isFocused })}
            color={"#EFEFEF"}
            textColor={"#2182e4"}
            text={model.full_name}
            onClick={() => props.onEditContact({ contact: model.id, id: row.id })}
            disabled={!isFocused}
          />
        ) : (
          <></>
        )}
      </div>
    </Cell>
  );
};

export default ContactCell;
