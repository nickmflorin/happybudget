import { RefObject, useRef, useImperativeHandle, useState, useEffect, useMemo } from "react";
import { isNil } from "lodash";

import { useTrackFirstRender, useDeepEqualMemo } from "lib/hooks";
import { isKeyboardEvent, isSyntheticClickEvent } from "lib/model/typeguards";

const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;

export interface IEditor<C extends Model.Model, V = C> {
  onChange: (value: V | null, e: Table.CellDoneEditingEvent, stopEditing?: boolean) => void;
  isFirstRender: boolean;
  value: V | null;
  changedEvent: Table.CellDoneEditingEvent | null;
  menuRef: RefObject<ExpandedModelMenuRef<C>>;
  menu: ExpandedModelMenuRef<C> | null;
}

interface UseModelMenuEditorParams<R extends Table.Row, M extends Model.Model, V> extends Table.CellEditorParams<R, M> {
  value: V | null;
  forwardedRef: RefObject<any>;
  menuRef?: RefObject<ExpandedModelMenuRef<any>>;
}

const useModelMenuEditor = <R extends Table.Row, M extends Model.Model, C extends Model.Model, V = C>(
  params: UseModelMenuEditorParams<R, M, V>
): [IEditor<C, V>] => {
  const _menuRef = useRef<ExpandedModelMenuRef<C>>(null);
  const isFirstRender = useTrackFirstRender();
  const [value, setValue] = useState<V | null>(params.value);
  const [changedEvent, setChangedEvent] = useState<Table.CellDoneEditingEvent | null>(null);
  const [stopEditingOnChangeEvent, setStopEditingOnChangeEvent] = useState(true);

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
      setStopEditingOnChangeEvent(true);
      if (isKeyboardEvent(changedEvent) && (changedEvent.code === "Enter" || changedEvent.code === "Tab")) {
        // Suppress keyboard navigation because we handle it ourselves.
        if (stopEditingOnChangeEvent === true) {
          params.stopEditing(true);
          params.onDoneEditing(changedEvent);
        }
      } else if (isSyntheticClickEvent(changedEvent)) {
        if (stopEditingOnChangeEvent === true) {
          params.stopEditing();
          params.onDoneEditing(changedEvent);
        }
      }
    }
  }, [useDeepEqualMemo(value), changedEvent]);

  useEffect(() => {
    if (!isNil(params.charPress)) {
      const menuRefObj = menuRef.current;
      if (!isNil(menuRefObj)) {
        menuRefObj.focusSearch(true, params.charPress);
        return () => {
          menuRefObj.focusSearch(false);
        };
      }
    } else {
      const menuRefObj = menuRef.current;
      if (!isNil(menuRefObj)) {
        menuRefObj.focusSearch(true, "");
      }
    }
  }, [params.charPress]);

  const wrapEditor = useMemo(() => {
    return {
      menuRef,
      menu: menuRef.current,
      isFirstRender,
      value,
      changedEvent,
      onChange: (model: V | null, e: Table.CellDoneEditingEvent, stopEditing = true) => {
        setStopEditingOnChangeEvent(stopEditing);
        setValue(model);
        setChangedEvent(e);
      }
    };
  }, [value]);

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
