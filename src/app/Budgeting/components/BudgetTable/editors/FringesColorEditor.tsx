import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { ColorSelect } from "components/fields";
import { useTrackFirstRender } from "lib/hooks";

import { selectFringeColors } from "../../../store/selectors";

const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;

interface FringesColorEditorProps extends Table.CellEditorParams<BudgetTable.FringeRow, Model.Fringe> {
  value: string | null;
}

const FringesColorEditor = (props: FringesColorEditorProps, ref: any) => {
  const isFirstRender = useTrackFirstRender();
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
