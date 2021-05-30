import { forwardRef, useImperativeHandle, useRef, useState, useEffect, SyntheticEvent } from "react";
import { isNil, map } from "lodash";

import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-light-svg-icons";

import { ExpandedModelTagsMenu, ExpandedModelMenuRef } from "components/menus";
import { CellDoneEditingEvent, CellEditorParams, isKeyboardEvent } from "../../model";

const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;

export interface FringesCellEditorProps<R extends Table.Row<G>, G extends Model.Group = Model.Group>
  extends CellEditorParams {
  onAddFringes: () => void;
  colId: keyof R;
  fringes: Model.Fringe[];
}

const FringesCellEditor = <R extends Table.Row>(props: FringesCellEditorProps<R>, ref: any) => {
  const isFirstRender = useRef(true);
  const menuRef = useRef<ExpandedModelMenuRef<Model.Fringe>>(null);
  const [value, setValue] = useState<number[]>(props.value);
  const [changedEvent, setChangedEvent] = useState<CellDoneEditingEvent | null>(null);

  useEffect(() => {
    if (!isNil(props.charPress)) {
      const menuRefObj = menuRef.current;
      if (!isNil(menuRefObj)) {
        menuRefObj.focusSearch(true, props.charPress);
        return () => {
          menuRefObj.focusSearch(false);
        };
      }
    }
  }, [props.charPress, menuRef.current]);

  useEffect(() => {
    // TODO: Unfortunately, since this is a pop up editor, AG Grid will not persist the
    // update to the cell value until the cell editing has stopped.  This is a temporary
    // attempt at a workaround for that.
    if (!isFirstRender.current && !isNil(changedEvent)) {
      if (isKeyboardEvent(changedEvent) && (changedEvent.code === "Enter" || changedEvent.code === "Tab")) {
        // Suppress keyboard navigation because we handle it ourselves.
        props.stopEditing(false);
        props.onDoneEditing(changedEvent);
      }
    }
  }, [value, changedEvent]);

  useEffect(() => {
    isFirstRender.current = false;
    setChangedEvent(null);
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
    <ExpandedModelTagsMenu<Model.Fringe>
      style={{ width: 160 }}
      highlightActive={false}
      checkbox={true}
      multiple={true}
      selected={value}
      models={props.fringes}
      onChange={(ms: Model.Fringe[], e: KeyboardEvent | SyntheticEvent | CheckboxChangeEvent) => {
        setValue(map(ms, (m: Model.Fringe) => m.id));
        setChangedEvent(e);
      }}
      menuRef={menuRef}
      searchIndices={["name"]}
      focusSearchOnCharPress={true}
      defaultFocusOnlyItem={true}
      defaultFocusFirstItem={true}
      autoFocusMenu={true}
      leftAlign={true}
      fillWidth={false}
      bottomItem={{
        onClick: () => props.onAddFringes(),
        text: "Add Fringes",
        icon: <FontAwesomeIcon className={"icon"} icon={faPlus} />
      }}
      onNoData={{
        onClick: () => props.onAddFringes(),
        text: "Add Fringes",
        icon: <FontAwesomeIcon className={"icon"} icon={faPlus} />,
        defaultFocus: true
      }}
      onNoSearchResults={{
        onClick: () => props.onAddFringes(),
        text: "Add Fringes",
        icon: <FontAwesomeIcon className={"icon"} icon={faPlus} />,
        defaultFocus: true
      }}
    />
  );
};

export default forwardRef(FringesCellEditor);
