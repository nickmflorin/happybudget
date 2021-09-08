import { useMemo } from "react";
import { find, isNil } from "lodash";
import classNames from "classnames";

import { Tag } from "components/tagging";
import { ButtonLink } from "components/buttons";
import { useContacts } from "store/hooks";

import { Cell } from "./generic";

interface ContactCellProps<M extends Model.Model> extends Table.CellProps<Tables.SubAccountRow, M, number | null> {
  readonly onEditContact: (id: number) => void;
}

const ContactCell = <M extends Model.Model>({ value, ...props }: ContactCellProps<M>): JSX.Element => {
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
    <Cell {...props} onClear={() => !isNil(props.setValue) && props.setValue(null)} hideClear={value === null}>
      <div style={{ display: "flex", justifyContent: "left" }}>
        {!isNil(model) ? (
          <Tag
            className={classNames("tag--contact", { focused: isFocused })}
            color={"#F5F5F5"}
            textColor={"#2182e4"}
            text={model.full_name}
            contentRender={(params: Omit<ITagRenderParams, "contentRender">) => (
              <ButtonLink disabled={!isFocused} onClick={() => props.onEditContact(model.id)}>
                {params.text}
              </ButtonLink>
            )}
          />
        ) : (
          <></>
        )}
      </div>
    </Cell>
  );
};

export default ContactCell;
