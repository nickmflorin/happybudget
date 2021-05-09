import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from "react";
import { isNil, map } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-light-svg-icons";

import { ICellEditorParams } from "@ag-grid-community/core";

import { TypeAgnosticExpandedModelTagsMenu } from "components/menus";
import { ExpandedModelTagsMenuRef } from "components/menus/ExpandedModelTagsMenu";

const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;

interface FringesCellEditorProps extends ICellEditorParams {
  onAddFringes: () => void;
  fringes: Model.Fringe[];
}

const FringesCellEditor = (props: FringesCellEditorProps, ref: any) => {
  const isFirstRender = useRef(true);
  const menuRef = useRef<ExpandedModelTagsMenuRef>(null);
  const [value, setValue] = useState<number[]>(props.value);

  useEffect(() => {
    if (!isNil(props.charPress)) {
      const menuRefObj = menuRef.current;
      if (!isNil(menuRefObj)) {
        menuRefObj.focusSearch(true, props.charPress);
      }
    }
  }, [props.charPress, menuRef.current]);

  useEffect(() => {
    // TODO: Eventually we want to make it so that clicking things in this popup does not propmpt
    // the pop up to close.
    if (!isFirstRender.current) {
      props.stopEditing();
    }
  }, [value]);

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  useImperativeHandle(ref, () => {
    return {
      getValue: () => value,
      isCancelBeforeStart() {
        // Gets called once before editing starts, which gives us an opportunity
        // to cancel the editing before it even starts.
        return props.keyPress === KEY_BACKSPACE || props.keyPress === KEY_DELETE;
      },
      isCancelAfterEnd() {
        // Gets called once when editing is finished.  If this returns true, then
        // the result of the edit will be ignored.
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

  return (
    <TypeAgnosticExpandedModelTagsMenu
      style={{ width: 160 }}
      highlightActive={false}
      checkbox={true}
      multiple={true}
      selected={value}
      models={props.fringes}
      onChange={(ms: Model.Fringe[]) => setValue(map(ms, (m: Model.Fringe) => m.id))}
      tagProps={{ style: { width: "100%", maxWidth: 120 } }}
      ref={menuRef}
      focusSearchOnCharPress={true}
      emptyItem={{
        onClick: () => props.onAddFringes(),
        text: "Add Fringes",
        icon: <FontAwesomeIcon className={"icon"} icon={faPlus} />
      }}
    />
  );
};

export default forwardRef(FringesCellEditor);
