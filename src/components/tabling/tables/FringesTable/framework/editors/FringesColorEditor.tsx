import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { ColorSelect } from "components/fields";
import { ui } from "lib";

const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;

interface FringesColorEditorProps
  extends Table.EditorParams<Tables.FringeRowData, Model.Fringe, Model.Group, Tables.FringeTableStore> {
  value: string | null;
}

const FringesColorEditor = (props: FringesColorEditorProps, ref: any) => {
  const isFirstRender = ui.hooks.useTrackFirstRender();
  const [value, setValue] = useState<string | null>(props.value);
  const colors = useSelector((state: Application.Authenticated.Store) => props.selector(state).fringeColors);

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
      },
      isPopup() {
        return true;
      },
      getPopupPosition() {
        return "under";
      }
    };
  });

  return <ColorSelect colors={colors} value={value} onChange={(v: string) => setValue(v)} />;
};

export default forwardRef(FringesColorEditor);
