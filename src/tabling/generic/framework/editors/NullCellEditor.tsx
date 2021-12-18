import { forwardRef, useImperativeHandle, ForwardedRef } from "react";

type DateEditorProps = Table.EditorParams<Tables.ActualRowData, Model.Actual>;

/**
 * Cell Editor used for cases where we do not want the cell to be directly
 * editable but still want the ability to copy and paste into the editor.
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const NullCellEditor = (props: DateEditorProps, ref: ForwardedRef<any>): JSX.Element => {
  useImperativeHandle(ref, () => {
    return {
      getValue: () => {
        return props.value;
      },
      isCancelBeforeStart() {
        return true;
      },
      isCancelAfterEnd() {
        return true;
      }
    };
  });

  return <div></div>;
};

export default forwardRef(NullCellEditor);
