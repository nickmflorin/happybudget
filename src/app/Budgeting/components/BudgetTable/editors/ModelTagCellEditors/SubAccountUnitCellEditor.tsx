import { forwardRef } from "react";
import { SubAccountUnits } from "lib/model";

import { ICellEditorParams } from "@ag-grid-community/core";
import ModelTagCellEditor from "./Generic";

const SubAccountUnitCellEditor = (props: ICellEditorParams, ref: any) => {
  return (
    <ModelTagCellEditor<Model.SubAccountUnit>
      searchIndices={["name"]}
      models={SubAccountUnits}
      forwardedRef={ref}
      {...props}
    />
  );
};

export default forwardRef(SubAccountUnitCellEditor);
