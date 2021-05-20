import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from "react";
import { isNil, map } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-light-svg-icons";

import { ICellEditorParams } from "@ag-grid-community/core";

import { ExpandedModelTagsMenu, ExpandedModelMenuRef } from "components/menus";

const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;

export interface FringesCellEditorProps<R extends Table.Row<G>, G extends Model.Group = Model.Group>
  extends ICellEditorParams {
  onAddFringes: () => void;
  onRowUpdate: (payload: any) => void;
  colId: keyof R;
  fringes: Model.Fringe[];
}

const FringesCellEditor = <R extends Table.Row>(props: FringesCellEditorProps<R>, ref: any) => {
  const isFirstRender = useRef(true);
  const menuRef = useRef<ExpandedModelMenuRef<Model.Fringe>>(null);
  const [value, setValue] = useState<number[]>(props.value);

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
    if (!isFirstRender.current) {
      if (!isNil(props.api)) {
        const row: R = props.node.data;
        const rowChangeData: Table.RowChangeData<R> = {};
        const change: Table.CellChange<any> = { oldValue: null, newValue: props.value };
        rowChangeData[props.colId] = change;
        const rowChange: Table.RowChange<R> = { id: row.id, data: rowChangeData };
        props.onRowUpdate(rowChange);
      }
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
    <ExpandedModelTagsMenu<Model.Fringe>
      style={{ width: 160 }}
      highlightActive={false}
      checkbox={true}
      multiple={true}
      selected={value}
      models={props.fringes}
      onChange={(ms: Model.Fringe[]) => setValue(map(ms, (m: Model.Fringe) => m.id))}
      tagProps={{ style: { width: "100%", maxWidth: 120 } }}
      menuRef={menuRef}
      searchIndices={["name"]}
      focusSearchOnCharPress={true}
      defaultFocusOnlyItem={true}
      defaultFocusFirstItem={true}
      bottomItem={{
        onClick: () => props.onAddFringes(),
        text: "Add Fringes",
        icon: <FontAwesomeIcon className={"icon"} icon={faPlus} />
      }}
      emptyItem={{
        onClick: () => props.onAddFringes(),
        text: "Add Fringes",
        icon: <FontAwesomeIcon className={"icon"} icon={faPlus} />
      }}
      noSearchResultsItem={{
        onClick: () => props.onAddFringes(),
        text: "Add Fringes",
        icon: <FontAwesomeIcon className={"icon"} icon={faPlus} />
      }}
    />
  );
};

export default forwardRef(FringesCellEditor);
