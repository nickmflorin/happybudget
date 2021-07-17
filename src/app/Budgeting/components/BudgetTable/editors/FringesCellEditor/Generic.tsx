import { forwardRef } from "react";
import { map } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-light-svg-icons";

import { ExpandedModelTagsMenu } from "components/menus";
import useModelMenuEditor from "../ModelMenuEditor";

export interface FringesCellEditorProps<R extends Table.Row> extends Table.CellEditorParams {
  onAddFringes: () => void;
  colId: keyof R;
  fringes: Model.Fringe[];
}

const FringesCellEditor = <R extends Table.Row>(props: FringesCellEditorProps<R>, ref: any) => {
  const [editor] = useModelMenuEditor<Model.Fringe, Model.Fringe[]>({ ...props, forwardedRef: ref });

  return (
    <ExpandedModelTagsMenu<Model.Fringe>
      style={{ width: 160 }}
      highlightActive={false}
      checkbox={true}
      multiple={true}
      selected={map(editor.value, (v: Model.Fringe) => v.id)}
      models={props.fringes}
      onChange={(ms: Model.Fringe[], e: Table.CellDoneEditingEvent) => editor.onChange(ms, e, false)}
      menuRef={editor.menuRef}
      searchIndices={["name"]}
      focusSearchOnCharPress={true}
      defaultFocusOnlyItem={true}
      defaultFocusFirstItem={true}
      autoFocusMenu={true}
      leftAlign={true}
      fillWidth={false}
      extra={[
        {
          onClick: () => props.onAddFringes(),
          text: "Add Fringes",
          icon: <FontAwesomeIcon className={"icon"} icon={faPlus} />,
          showOnNoSearchResults: true,
          showOnNoData: true,
          focusOnNoSearchResults: true,
          focusOnNoData: true,
          leaveAtBottom: true
        }
      ]}
    />
  );
};

export default forwardRef(FringesCellEditor);
