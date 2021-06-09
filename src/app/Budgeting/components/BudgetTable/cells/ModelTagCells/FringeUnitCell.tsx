import ModelTagCell, { ModelTagCellProps } from "./ModelTagCell";

const FringeUnitCell = (props: ModelTagCellProps<Model.FringeUnit, BudgetTable.FringeRow>): JSX.Element => (
  <ModelTagCell {...props} leftAlign={true} />
);
export default FringeUnitCell;
