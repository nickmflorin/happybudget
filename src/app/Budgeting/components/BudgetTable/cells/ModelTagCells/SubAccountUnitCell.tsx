import ModelTagCell, { ModelTagCellProps } from "./ModelTagCell";

const SubAccountUnitCell = (props: ModelTagCellProps<Model.Tag, BudgetTable.FringeRow>): JSX.Element => (
  <ModelTagCell {...props} leftAlign={true} />
);
export default SubAccountUnitCell;
