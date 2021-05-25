import { forwardRef } from "react";
import { useSelector } from "react-redux";
import { ICellEditorParams } from "@ag-grid-community/core";

import { selectSubAccountUnits } from "../../../../store/selectors";

import ModelTagCellEditor from "./Generic";

const SubAccountUnitCellEditor = (props: ICellEditorParams, ref: any) => {
  const units = useSelector(selectSubAccountUnits);
  return <ModelTagCellEditor<Model.Tag> searchIndices={["title"]} models={units} forwardedRef={ref} {...props} />;
};

export default forwardRef(SubAccountUnitCellEditor);
