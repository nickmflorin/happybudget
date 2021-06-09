import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { ColorSelect } from "components/forms";
import { useTrackFirstRender } from "lib/hooks";

import { selectFringeColors } from "../../../store/selectors";

export interface ModelTagCellEditorProps extends BudgetTable.CellEditorParams {}

const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;

interface FringesColorEditorProps extends BudgetTable.CellEditorParams {
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
