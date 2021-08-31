import { ForwardedRef, useImperativeHandle, useState, useEffect, useMemo } from "react";
import { isNil } from "lodash";

import { hooks, tabling, ui } from "lib";

const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;

export type UseModelMenuEditorParams<
  V = ID,
  R extends Table.RowData = Table.RowData,
  M extends Model.Model = Model.Model,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
> = Table.EditorParams<R, M, S, V>;

export type IEditor<
  V = ID,
  C extends Model.Model = Model.Model,
  R extends Table.RowData = Table.RowData,
  M extends Model.Model = Model.Model,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
> = Omit<UseModelMenuEditorParams<V, R, M, S>, "forwardedRef"> & {
  readonly onChange: (value: V | null, e: Table.CellDoneEditingEvent, stopEditing?: boolean) => void;
  readonly isFirstRender: boolean;
  readonly value: V | null;
  readonly changedEvent: Table.CellDoneEditingEvent | null;
  readonly menu: NonNullRef<IMenuRef<C>>;
};

/* eslint-disable indent */
const useModelMenuEditor = <
  C extends Model.Model,
  V = C,
  R extends Table.RowData = Table.RowData,
  M extends Model.Model = Model.Model,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
>(
  params: UseModelMenuEditorParams<V, R, M, S> & { readonly forwardedRef: ForwardedRef<any> }
): [IEditor<V, C, R, M, S>] => {
  const menu = ui.hooks.useMenu<C>();

  const isFirstRender = ui.hooks.useTrackFirstRender();
  const [value, setValue] = useState<V | null>(params.value);
  const [changedEvent, setChangedEvent] = useState<Table.CellDoneEditingEvent | null>(null);
  const [stopEditingOnChangeEvent, setStopEditingOnChangeEvent] = useState(true);

  useEffect(() => {
    setChangedEvent(null);
  }, []);

  useEffect(() => {
    if (!isFirstRender && !isNil(changedEvent)) {
      setChangedEvent(null);
      setStopEditingOnChangeEvent(true);
      if (
        tabling.typeguards.isKeyboardEvent(changedEvent) &&
        (changedEvent.code === "Enter" || changedEvent.code === "Tab")
      ) {
        // Suppress keyboard navigation because we handle it ourselves.
        if (stopEditingOnChangeEvent === true) {
          params.stopEditing(true);
          params.onDoneEditing(changedEvent);
        }
      } else if (tabling.typeguards.isSyntheticClickEvent(changedEvent)) {
        if (stopEditingOnChangeEvent === true) {
          params.stopEditing();
          params.onDoneEditing(changedEvent);
        }
      }
    }
  }, [hooks.useDeepEqualMemo(value), changedEvent]);

  useEffect(() => {
    if (!isNil(params.charPress)) {
      menu.current.focusSearch(true, params.charPress);
    } else {
      menu.current.focusSearch(true, "");
    }
  }, [params.charPress]);

  const wrapEditor = useMemo(() => {
    return {
      ...params,
      isFirstRender,
      menu,
      value,
      changedEvent,
      focusSearch: menu.current.focusSearch,
      onChange: (model: V | null, e: Table.CellDoneEditingEvent, stopEditing = true) => {
        setStopEditingOnChangeEvent(stopEditing);
        setValue(model);
        setChangedEvent(e);
      }
    };
  }, [value, menu]);

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
