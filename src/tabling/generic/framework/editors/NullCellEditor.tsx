import { forwardRef, useImperativeHandle, ForwardedRef } from "react";

/**
 * Cell Editor used for cases where we do not want the cell to be directly
 * editable but still want the ability to copy and paste into the editor.
 */
const NullCellEditor = <
  R extends Table.RowData & { readonly date: string | null },
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>(
  props: Table.EditorProps<R, M, C, S>,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  ref: ForwardedRef<any>
): JSX.Element => {
  useImperativeHandle(ref, () => {
    return {
      getValue: () => {
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
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
