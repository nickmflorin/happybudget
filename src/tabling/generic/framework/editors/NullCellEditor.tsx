import { forwardRef, useImperativeHandle } from "react";

type DateEditorProps = Table.EditorParams<Tables.ActualRow, Model.Actual>;

/**
 * Cell Editor used for cases where we do not want the cell to be directly
 * editable but still want the ability to copy and paste into the editor.
 */
const NullCellEditor = (props: DateEditorProps, ref: any): JSX.Element => {
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
