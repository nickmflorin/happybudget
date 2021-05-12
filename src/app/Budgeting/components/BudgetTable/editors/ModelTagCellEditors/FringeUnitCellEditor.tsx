import { forwardRef } from "react";
import { FringeUnits } from "lib/model";

import { ICellEditorParams } from "@ag-grid-community/core";
import ModelTagCellEditor from "./Generic";

const FringeUnitCellEditor = (props: ICellEditorParams, ref: any) => {
  return <ModelTagCellEditor<Model.FringeUnit> models={FringeUnits} forwardedRef={ref} {...props} />;
};

export default forwardRef(FringeUnitCellEditor);
