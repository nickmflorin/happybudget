import { useMemo } from "react";
import { find, isNil } from "lodash";

import { Tag } from "components/tagging";
import { useContacts } from "store/hooks";

import Cell, { CellProps } from "./Cell";

const ContactCell = (props: CellProps<BudgetTable.SubAccountRow>): JSX.Element => {
  const contacts = useContacts();
  const model = useMemo(() => find(contacts, { id: props.children } as any) || null, [props.children, contacts]);
  return (
    <Cell {...props} onClear={() => !isNil(props.setValue) && props.setValue(null)} hideClear={props.children === null}>
      <div style={{ display: "flex", justifyContent: "left" }}>
        {!isNil(model) ? <Tag color={"#EFEFEF"} textColor={"#2182e4"} text={model.full_name} /> : <></>}
      </div>
    </Cell>
  );
};

export default ContactCell;
