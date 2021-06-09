import { RefObject, useRef, useImperativeHandle, useState, useEffect, useMemo } from "react";
import { isNil } from "lodash";

import { useTrackFirstRender } from "lib/hooks";
import { isKeyboardEvent, isSyntheticClickEvent } from "lib/model/typeguards";
import { ExpandedModelMenuRef } from "components/menus";

const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;

export interface IEditor<M extends Model.Model, V = M> {
  onChange: (value: V | null, e: BudgetTable.CellDoneEditingEvent) => void;
  isFirstRender: boolean;
  value: V | null;
  changedEvent: BudgetTable.CellDoneEditingEvent | null;
  menuRef: RefObject<ExpandedModelMenuRef<M>>;
  menu: ExpandedModelMenuRef<M> | null;
}

interface UseModelMenuEditorParams<V> extends BudgetTable.CellEditorParams {
  value: V | null;
  forwardedRef: RefObject<any>;
  menuRef?: RefObject<ExpandedModelMenuRef<any>>;
}

const useModelMenuEditor = <M extends Model.Model, V = M>(params: UseModelMenuEditorParams<V>): [IEditor<M, V>] => {
  const _menuRef = useRef<ExpandedModelMenuRef<M>>(null);
  const isFirstRender = useTrackFirstRender();
  const [value, setValue] = useState<V | null>(params.value);
  const [changedEvent, setChangedEvent] = useState<BudgetTable.CellDoneEditingEvent | null>(null);

  const menuRef = useMemo(() => {
    if (!isNil(params.menuRef)) {
      return params.menuRef;
    }
    return _menuRef;
  }, [params.menuRef]);

  useEffect(() => {
    setChangedEvent(null);
  }, []);

  useEffect(() => {
    if (!isFirstRender && !isNil(changedEvent)) {
      setChangedEvent(null);
      if (isKeyboardEvent(changedEvent) && (changedEvent.code === "Enter" || changedEvent.code === "Tab")) {
        // Suppress keyboard navigation because we handle it ourselves.
        params.stopEditing(true);
        params.onDoneEditing(changedEvent);
      } else if (isSyntheticClickEvent(changedEvent)) {
        params.stopEditing();
        params.onDoneEditing(changedEvent);
      }
    }
  }, [value, changedEvent]);

  useEffect(() => {
    if (!isNil(params.charPress)) {
      const menuRefObj = menuRef.current;
      if (!isNil(menuRefObj)) {
        menuRefObj.focusSearch(true, params.charPress);
        return () => {
          menuRefObj.focusSearch(false);
        };
      }
    }
  }, [params.charPress, menuRef.current]);

  const wrapEditor = useMemo(() => {
    return {
      menuRef,
      menu: menuRef.current,
      isFirstRender,
      value,
      changedEvent,
      onChange: (model: V | null, e: BudgetTable.CellDoneEditingEvent) => {
        setValue(model);
        setChangedEvent(e);
      }
    };
  }, []);

  useImperativeHandle(params.forwardedRef, () => {
    return {
      getValue: () => {
        return value;
      },
      isCancelBeforeStart() {
        return params.keyPress === KEY_BACKSPACE || params.keyPress === KEY_DELETE;
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

  const keyListener = (e: KeyboardEvent) => {
    if (e.code === "Escape") {
      e.stopPropagation();
      params.stopEditing();
    }
  };

  useEffect(() => {
    // By default, AG Grid will exit the edit mode when Escape is clicked and
    // we are in the search bar.  However, if we are in the menu, this will not
    // work - so we need to manually stop editing on Escape.
    window.addEventListener("keydown", keyListener);
    return () => window.removeEventListener("keydown", keyListener);
  }, []);

  return [wrapEditor];
};

export default useModelMenuEditor;
