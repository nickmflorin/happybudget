import { forwardRef, ForwardedRef } from "react";

/**
 * Cell Editor used for cases where we do not want the cell to be directly
 * editable but still want the ability to copy and paste into the editor.
 */
const NullCellEditor = (props: any, ref: ForwardedRef<any>) => {
  return <></>;
};

export default forwardRef(NullCellEditor);
