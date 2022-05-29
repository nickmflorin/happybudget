import { forwardRef, useImperativeHandle, useState, useEffect, ForwardedRef } from "react";
import { useSelector } from "react-redux";

import * as store from "store";

import { ColorGrid } from "components/tagging";
import { ui } from "lib";

const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;

type FringesColorEditorProps<
  B extends Model.Budget | Model.Template,
  P extends Model.Account | Model.SubAccount
> = Table.EditorProps<
  Tables.FringeRowData,
  Model.Fringe,
  FringesTableContext<B, P, false>,
  Tables.FringeTableStore,
  string | null
>;

const FringesColorEditor = <B extends Model.Budget | Model.Template, P extends Model.Account | Model.SubAccount>(
  props: FringesColorEditorProps<B, P>,
  ref: ForwardedRef<Table.AgEditorRef<string | null>>
) => {
  const isFirstRender = ui.useTrackFirstRender();
  const [value, setValue] = useState<string | null>(props.value);
  const colors = useSelector(store.selectors.selectFringeColors);
  const colorsLoading = useSelector((s: Application.Store) => store.selectors.selectFringeColorStore(s).loading);

  useEffect(() => {
    if (!isFirstRender) {
      props.stopEditing();
    }
  }, [value]);

  useImperativeHandle(ref, () => {
    return {
      getValue: () => {
        return value;
      },
      isCancelBeforeStart() {
        return props.keyPress === KEY_BACKSPACE || props.keyPress === KEY_DELETE;
      },
      isCancelAfterEnd() {
        return false;
      }
    };
  });

  return (
    <ColorGrid
      useDefault={true}
      colors={colors}
      colorSize={20}
      selectable={true}
      loading={colorsLoading}
      value={value}
      treatDefaultAsNull={true}
      onChange={(v: string | null) => setValue(v)}
    />
  );
};

export default forwardRef(FringesColorEditor) as typeof FringesColorEditor;
