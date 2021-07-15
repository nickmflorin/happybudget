import { useMemo } from "react";
import { find } from "lodash";
import { useContacts } from "store/hooks";
import ModelTagCell, { ModelTagCellProps } from "./ModelTagCell";

const ContactCell = ({
  children,
  ...props
}: Omit<ModelTagCellProps<Model.Contact>, "children"> & { children: number | null }): JSX.Element => {
  const contacts = useContacts();
  const model = useMemo(() => find(contacts, { id: children } as any) || null, [children, contacts]);
  return (
    <ModelTagCell {...props} leftAlign={true}>
      {model}
    </ModelTagCell>
  );
};

export default ContactCell;
