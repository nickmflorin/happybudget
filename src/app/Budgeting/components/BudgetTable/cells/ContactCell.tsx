import { useMemo } from "react";
import { find, isNil } from "lodash";

import { Tag } from "components/tagging";
import { ButtonLink } from "components/buttons";
import { useContacts } from "store/hooks";

import Cell, { CellProps } from "./Cell";
import classNames from "classnames";

interface ContactCellProps extends CellProps<BudgetTable.SubAccountRow> {
  readonly onEditContact: (id: number) => void;
}

const ContactCell = (props: ContactCellProps): JSX.Element => {
  const contacts = useContacts();
  const model = useMemo(() => find(contacts, { id: props.children } as any) || null, [props.children, contacts]);

  let isFocused = false;
  const focusedCell = props.api.getFocusedCell();
  if (!isNil(focusedCell)) {
    if (focusedCell.column === props.column && focusedCell.rowIndex === props.rowIndex) {
      isFocused = true;
    }
  }
  return (
    <Cell {...props} onClear={() => !isNil(props.setValue) && props.setValue(null)} hideClear={props.children === null}>
      <div style={{ display: "flex", justifyContent: "left" }}>
        {!isNil(model) ? (
          <Tag
            className={classNames("tag--contact", { focused: isFocused })}
            color={"#EFEFEF"}
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
