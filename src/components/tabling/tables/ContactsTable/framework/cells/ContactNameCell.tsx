import { isNil } from "lodash";

import { util } from "lib";
import { UserImageOrInitials } from "components/images";
import { Cell } from "components/tabling/generic/framework/cells";

interface ContactNameCellProps extends Table.CellProps<Tables.ContactRowData, Model.Contact, Tables.ContactTableStore> {
  readonly onEditContact: (id: number) => void;
}

const ContactNameCell = ({ value, ...props }: ContactNameCellProps): JSX.Element => {
  const row: Table.BodyRow<Tables.ContactRowData> = props.node.data;
  return (
    <Cell {...props}>
      <div style={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
        <UserImageOrInitials
          circle={true}
          src={!isNil(row.data.image) ? row.data.image.url : null}
          firstName={row.data.first_name}
          lastName={row.data.last_name}
          initialsStyle={{ width: 28, height: 28, marginRight: 8 }}
          imageProps={{ wrapperStyle: { minWidth: 28, width: 28, height: 28, marginRight: 8 } }}
          hideOnNoInitials={true}
        />
        {util.conditionalJoinString(row.data.first_name, row.data.last_name)}
      </div>
    </Cell>
  );
};

export default ContactNameCell;
