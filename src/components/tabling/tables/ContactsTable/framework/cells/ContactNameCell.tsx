import { isNil } from "lodash";

import { util } from "lib";
import { UserImageOrInitials } from "components/images";
import { Cell } from "components/tabling/generic/framework/cells";

interface ContactNameCellProps
  extends Table.CellProps<Tables.ContactRowData, Model.Contact, Tables.ContactTableStore, Model.ContactNamesAndImage> {
  readonly onEditContact: (id: number) => void;
}

const ContactNameCell = ({ value, ...props }: ContactNameCellProps): JSX.Element => {
  if (!isNil(value)) {
    return (
      <Cell {...props}>
        <div style={{ display: "flex", justifyContent: "left", alignItems: "center" }}>
          <UserImageOrInitials
            circle={true}
            src={!isNil(value.image) ? value.image.url : null}
            firstName={value.first_name}
            lastName={value.last_name}
            initialsStyle={{ width: 28, height: 28, marginRight: 8 }}
            imageProps={{ wrapperStyle: { width: 28, height: 28, marginRight: 8 } }}
            hideOnNoInitials={true}
          />
          {util.conditionalJoinString(value.first_name, value.last_name)}
        </div>
      </Cell>
    );
  }
  return <span></span>;
};

export default ContactNameCell;
