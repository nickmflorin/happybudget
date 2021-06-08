import { isNil } from "lodash";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-regular-svg-icons";

import { IconButton } from "components/buttons";

import Cell from "./Cell";
import ValueCell, { ValueCellProps } from "./ValueCell";

import "./index.scss";

interface IdentifierCellProps<R extends Table.Row<G>, G extends Model.Group = Model.Group> extends ValueCellProps<R> {
  onGroupEdit?: (group: G) => void;
}

const IdentifierCell = <R extends Table.Row<G>, G extends Model.Group = Model.Group>({
  onGroupEdit,
  ...props
}: IdentifierCellProps<R, G>): JSX.Element => {
  const row: R = props.node.data;
  if (row.meta.isGroupFooter === true && row.group !== null) {
    const group: G = row.group;
    return (
      <Cell className={"cell--identifier"} {...props}>
        <div style={{ display: "flex" }}>
          <span>{`${row.group.name} (${row.group.children.length} Line Items)`}</span>
          <IconButton
            className={"btn--edit-group"}
            size={"small"}
            icon={<FontAwesomeIcon icon={faEdit} />}
            onClick={() => !isNil(onGroupEdit) && onGroupEdit(group)}
          />
        </div>
      </Cell>
    );
  }
  return (
    <ValueCell
      {...props}
      className={classNames(
        "cell--identifier",
        row.meta.isTableFooter === false && row.meta.isBudgetFooter === false ? props.className : undefined
      )}
    >
      {props.children}
    </ValueCell>
  );
};

export default IdentifierCell;
