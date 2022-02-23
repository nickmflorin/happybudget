import { forwardRef, useImperativeHandle, useState, useEffect, ForwardedRef } from "react";
import { useSelector } from "react-redux";

import { ColorGrid } from "components/tagging";
import { ui } from "lib";

const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;

interface FringesColorEditorProps
  extends Table.EditorParams<Tables.FringeRowData, Model.Fringe, Tables.FringeTableStore> {
  value: string | null;
}

const FringesColorEditor = (props: FringesColorEditorProps, ref: ForwardedRef<Table.AgEditorRef<string | null>>) => {
  const isFirstRender = ui.hooks.useTrackFirstRender();
  const [value, setValue] = useState<string | null>(props.value);
  const colors = useSelector((state: Application.Store) => props.selector(state).fringeColors);

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
      value={value}
      treatDefaultAsNull={true}
      onChange={(v: string | null) => setValue(v)}
    />
  );
};

export default forwardRef(FringesColorEditor);
