import ModelTagCell, { ModelTagCellProps } from "./ModelTagCell";

const FringeUnitCell = (props: ModelTagCellProps<Model.FringeUnit>): JSX.Element => (
  <ModelTagCell {...props} leftAlign={true} />
);
export default FringeUnitCell;
