import { useMemo } from "react";
import { find, isNil } from "lodash";
import classNames from "classnames";

import { Tag } from "components/tagging";
import { useContacts } from "store/hooks";

import { Cell } from "./generic";

interface ContactCellProps<
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
> extends Table.CellProps<R, M, S, number | null> {
  readonly onEditContact: (id: number) => void;
}

/* eslint-disable indent */
const ContactCell = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
>({
  value,
  ...props
}: ContactCellProps<R, M, S>): JSX.Element => {
  const contacts = useContacts();
  const model = useMemo(() => (!isNil(value) ? find(contacts, { id: value } as any) || null : null), [value, contacts]);

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
            onClick={() => props.onEditContact(model.id)}
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
