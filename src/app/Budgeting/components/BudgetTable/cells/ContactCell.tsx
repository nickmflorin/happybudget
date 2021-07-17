import { useMemo } from "react";
import { find, isNil } from "lodash";

import { Tag } from "components/tagging";
import { ButtonLink } from "components/buttons";
import { useContacts } from "store/hooks";

import Cell, { CellProps } from "./Cell";

interface ContactCellProps extends CellProps<BudgetTable.SubAccountRow> {
  readonly onEditContact: (contact: Model.Contact) => void;
}

const ContactCell = (props: ContactCellProps): JSX.Element => {
  const contacts = useContacts();
  const model = useMemo(() => find(contacts, { id: props.children } as any) || null, [props.children, contacts]);
  return (
    <Cell {...props} onClear={() => !isNil(props.setValue) && props.setValue(null)} hideClear={props.children === null}>
      <div style={{ display: "flex", justifyContent: "left" }}>
        {!isNil(model) ? (
          <Tag
            className={"tag--contact"}
            color={"#EFEFEF"}
            textColor={"#2182e4"}
            text={model.full_name}
            contentRender={(params: Omit<ITagRenderParams, "contentRender">) => (
              <ButtonLink onClick={() => !isNil(model) && props.onEditContact(model)}>{params.text}</ButtonLink>
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
