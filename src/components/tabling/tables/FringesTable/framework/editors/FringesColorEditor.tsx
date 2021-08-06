import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { ColorSelect } from "components/fields";
import { hooks } from "lib";

// It is not ideal that we are importing part of the store in a generalized components
// directory.  We should consider alternate solutions to this or potentially moving the
// cell component into the app directory.
import { selectFringeColors } from "app/Budgeting/store/selectors";

const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;

interface FringesColorEditorProps extends Table.EditorParams<Tables.FringeRow, Model.Fringe> {
  value: string | null;
}

const FringesColorEditor = (props: FringesColorEditorProps, ref: any) => {
  const isFirstRender = hooks.useTrackFirstRender();
  const [value, setValue] = useState<string | null>(props.value);
  const colors = useSelector(selectFringeColors);

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
