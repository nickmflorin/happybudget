import { ForwardedRef, useImperativeHandle, useState, useEffect, useMemo } from "react";
import { isNil } from "lodash";

import { hooks, tabling, ui } from "lib";

const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;

export type UseModelMenuEditorParams<
  V extends Table.RawRowValue,
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> = Table.EditorParams<R, M, S, V | null>;

export type IEditor<
  V extends Table.RawRowValue,
  C extends Model.Model,
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> = Omit<UseModelMenuEditorParams<V, R, M, S>, "forwardedRef"> & {
  readonly onChange: (value: V | null, e: Table.CellDoneEditingEvent, stopEditing?: boolean) => void;
  readonly isFirstRender: boolean;
  readonly value: V | null;
  readonly changedEvent: Table.CellDoneEditingEvent | null;
  readonly menu: NonNullRef<IMenuRef<MenuItemSelectedState, C>>;
};

const useModelMenuEditor = <
  V extends Table.RawRowValue,
  C extends Model.Model,
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>(
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  params: UseModelMenuEditorParams<V, R, M, S> & { readonly forwardedRef: ForwardedRef<any> }
): [IEditor<V, C, R, M, S>] => {
  const menu = ui.hooks.useMenu<MenuItemSelectedState, C>();

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
        tabling.events.isKeyboardEvent(changedEvent) &&
        (changedEvent.code === "Enter" || changedEvent.code === "Tab")
      ) {
        // Suppress keyboard navigation because we handle it ourselves.
        if (stopEditingOnChangeEvent === true) {
          params.stopEditing(true);
          params.onDoneEditing(changedEvent);
        }
      } else if (tabling.events.isSyntheticClickEvent(changedEvent)) {
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
        e.stopPropagation();
        e.preventDefault();
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
      }
    };
  });

  useEffect(() => {
    const keyListener = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        e.stopPropagation();
        params.stopEditing();
      }
    };
    /* By default, AG Grid will exit the edit mode when Escape is clicked and
       we are in the search bar.  However, if we are in the menu, this will not
       work - so we need to manually stop editing on Escape. */
    window.addEventListener("keydown", keyListener);
    return () => window.removeEventListener("keydown", keyListener);
  }, []);

  return [wrapEditor];
};

export default useModelMenuEditor;
