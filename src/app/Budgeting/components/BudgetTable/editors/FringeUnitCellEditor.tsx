import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from "react";
import { isNil } from "lodash";

import { FringeUnits } from "lib/model";
import { TypeAgnosticExpandedModelTagsMenu } from "components/menus";
import { ExpandedModelTagsMenuRef } from "components/menus/ExpandedModelTagsMenu";

import { ICellEditorParams } from "@ag-grid-community/core";

const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;

const FringeUnitCellEditor = (props: ICellEditorParams, ref: any) => {
  const isFirstRender = useRef(true);
  const menuRef = useRef<ExpandedModelTagsMenuRef>(null);
  const [value, setValue] = useState<Model.FringeUnit | null>(props.value);

  useEffect(() => {
    if (!isNil(props.charPress)) {
      const menuRefObj = menuRef.current;
      if (!isNil(menuRefObj)) {
        menuRefObj.focusSearch(true, props.charPress);
      }
    }
  }, [props.charPress, menuRef.current]);

  useEffect(() => {
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
      selected={!isNil(value) ? value.id : null}
      models={FringeUnits}
      onChange={(m: Model.FringeUnit) => setValue(m)}
      multiple={false}
      tagProps={{ style: { width: "100%", maxWidth: 120 } }}
      ref={menuRef}
      focusSearchOnCharPress={true}
    />
  );
};

export default forwardRef(FringeUnitCellEditor);