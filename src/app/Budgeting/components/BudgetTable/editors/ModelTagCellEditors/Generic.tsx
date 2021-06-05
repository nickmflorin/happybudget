import { isNil } from "lodash";

import { ExpandedModelTagsMenu } from "components/menus";
import { CellEditorParams, CellDoneEditingEvent } from "../../model";
import useModelMenuEditor from "../ModelMenuEditor";

export interface ModelTagCellEditorProps extends CellEditorParams {}

interface PrivateModelTagCellEditorProps<M extends Model.Model> extends ModelTagCellEditorProps {
  models: M[];
  /* eslint-disable react/no-unused-prop-types */
  forwardedRef: any;
  searchIndices: SearchIndicies;
}

const ModelTagCellEditor = <M extends Model.Model>(props: PrivateModelTagCellEditorProps<M>) => {
  const [editor] = useModelMenuEditor<M>(props);

  return (
    <ExpandedModelTagsMenu<M>
      style={{ width: 160 }}
      selected={!isNil(editor.value) ? editor.value.id : null}
      models={props.models}
      searchIndices={props.searchIndices}
      defaultFocusOnlyItem={true}
      onChange={(m: M, e: CellDoneEditingEvent) => editor.onChange(m, e)}
      multiple={false}
      fillWidth={false}
      leftAlign={true}
      menuRef={editor.menuRef}
      autoFocusMenu={true}
      focusSearchOnCharPress={true}
    />
  );
};

export default ModelTagCellEditor;
