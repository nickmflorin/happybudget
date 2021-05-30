import { useImperativeHandle, useRef, useState, useEffect } from "react";
import { isNil } from "lodash";

import { ExpandedModelTagsMenu, ExpandedModelMenuRef } from "components/menus";

import { ICellEditorParams } from "@ag-grid-community/core";

const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;

interface ModelTagCellEditorProps<M extends Model.Model> extends Omit<ICellEditorParams, "onKeyDown"> {
  models: M[];
  forwardedRef: any;
  searchIndices: SearchIndicies;
  onKeyDown: () => void;
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

  // useEffect(() => {
  //   if (!isFirstRender.current) {
  //     props.stopEditing();
  //   }
  // }, [value]);

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

  const keyListener = (e: KeyboardEvent) => {
    if (e.code === "Escape") {
      e.stopPropagation();
      props.stopEditing();
    }
  };

  useEffect(() => {
    // By default, AG Grid will exit the edit mode when Escape is clicked and
    // we are in the search bar.  However, if we are in the menu, this will not
    // work - so we need to manually stop editing on Escape.
    window.addEventListener("keydown", keyListener);
    return () => window.removeEventListener("keydown", keyListener);
  }, []);

  return (
    <ExpandedModelTagsMenu<M>
      style={{ width: 160 }}
      selected={!isNil(value) ? value.id : null}
      models={props.models}
      searchIndices={props.searchIndices}
      defaultFocusOnlyItem={true}
      onChange={(m: M) => {
        setValue(m);
        props.onKeyDown();
        props.stopEditing();
      }}
      multiple={false}
      fillWidth={false}
      leftAlign={true}
      menuRef={menuRef}
      autoFocusMenu={true}
      focusSearchOnCharPress={true}
    />
  );
};

export default ModelTagCellEditor;
