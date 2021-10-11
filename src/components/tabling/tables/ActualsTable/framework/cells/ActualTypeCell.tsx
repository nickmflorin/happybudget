import { framework } from "components/tabling/generic";
import { ModelTagCell } from "components/tabling/generic/framework/cells";

const ActualTypeCell = (
  props: framework.cells.ModelTagCellProps<Tables.ActualRowData, Model.Actual, Tables.ActualTableStore, Model.Tag>
): JSX.Element => {
  return <ModelTagCell {...props} leftAlign={true} />;
};

export default ActualTypeCell;
