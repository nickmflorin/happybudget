import { isNil } from "lodash";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-regular-svg-icons";

import { ICellRendererParams, RowNode } from "ag-grid-community";
import { IconButton } from "components/control/buttons";

import "./IdentifierCell.scss";

interface IdentifierCellProps extends ICellRendererParams, StandardComponentProps {
  value: string | number | null;
  node: RowNode;
  onGroupEdit?: (group: IGroup<any>) => void;
}

const IdentifierCell = <R extends Table.Row<any>>({
  value,
  node,
  className,
  style = {},
  onGroupEdit
}: IdentifierCellProps): JSX.Element => {
  const row: R = node.data;
  if (row.meta.isGroupFooter === true && row.group !== null) {
    return (
      <div className={"cell--identifier"}>
        <span>{`${row.group.name} (${row.group.children.length} Line Items)`}</span>
        <IconButton
          className={"btn--edit-group"}
          size={"small"}
          icon={<FontAwesomeIcon icon={faEdit} />}
          onClick={() => !isNil(onGroupEdit) && onGroupEdit(row.group)}
        />
      </div>
    );
  }
  return (
    <div className={classNames("cell--identifier", className)} style={style}>
      {value}
    </div>
  );
};

export default IdentifierCell;
