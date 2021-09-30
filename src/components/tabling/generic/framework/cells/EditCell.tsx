import { isNil } from "lodash";

import { Icon, ShowHide } from "components";
import { IconButton } from "components/buttons";

interface EditCellProps<
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
> extends Table.CellProps<R, M, S, null> {
  readonly onEdit: (row: Table.BodyRow<R>) => void;
}

/* eslint-disable indent */
const EditCell = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
>({
  onEdit,
  node,
  ...props
}: EditCellProps<R, M, S>): JSX.Element => {
  const row: Table.BodyRow<R> = node.data;

  const rowIsHovered = () => {
    const parent = props.eGridCell.parentElement;
    if (!isNil(parent)) {
      const cls = parent.getAttribute("class");
      return cls?.indexOf("ag-row-hover") !== -1;
    }
    return false;
  };

  return (
    <div>
      <ShowHide show={rowIsHovered()}>
        <IconButton
          className={"ag-grid-action-button"}
          size={"small"}
          icon={<Icon icon={"pencil"} weight={"regular"} />}
          onClick={() => onEdit(row)}
          tooltip={{ title: "Edit", placement: "bottom", overlayClassName: "tooltip-lower" }}
        />
      </ShowHide>
    </div>
  );
};

export default EditCell;
