import { useImperativeHandle, useRef, useState, useEffect } from "react";
import { isNil } from "lodash";

import { ExpandedModelTagsMenu, ExpandedModelMenuRef } from "components/menus";

import { ICellEditorParams } from "@ag-grid-community/core";

const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;

interface ModelTagCellEditorProps<M extends Model.Model> extends ICellEditorParams {
  models: M[];
  forwardedRef: any;
  searchIndices: SearchIndicies;
}

const ModelTagCellEditor = <M extends Model.Model>(props: ModelTagCellEditorProps<M>) => {
  const isFirstRender = useRef(true);
  const menuRef = useRef<ExpandedModelMenuRef<M>>(null);
  const [value, setValue] = useState<M | null>(props.value);

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

  useImperativeHandle(props.forwardedRef, () => {
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
    <ExpandedModelTagsMenu<M>
      style={{ width: 160 }}
      selected={!isNil(value) ? value.id : null}
      models={props.models}
      searchIndices={props.searchIndices}
      onChange={(m: M) => setValue(m)}
      multiple={false}
      tagProps={{ style: { width: "100%", maxWidth: 120 } }}
      menuRef={menuRef}
      focusSearchOnCharPress={true}
    />
  );
};

export default ModelTagCellEditor;
