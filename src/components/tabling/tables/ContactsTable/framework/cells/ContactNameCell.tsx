import { isNil } from "lodash";

import { model } from "lib";
import { UserImageOrInitials } from "components/images";
import { Cell } from "components/tabling/generic/framework/cells";

interface ContactNameCellProps
  extends Table.CellProps<
    Tables.ContactRowData,
    Model.Contact,
    Model.Group,
    Tables.ContactTableStore,
    Model.ContactNamesAndImage
  > {
  readonly onEditContact: (id: ID) => void;
}

const ContactNameCell = ({ value, ...props }: ContactNameCellProps): JSX.Element => {
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
        {model.util.displayFirstAndLastName(value.first_name, value.last_name)}
      </div>
    </Cell>
  );
};

export default ContactNameCell;
