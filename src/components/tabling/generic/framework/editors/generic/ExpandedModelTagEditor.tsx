import { ExpandedModelTagsMenu } from "components/menus";
import { IEditor } from "./useModelMenuEditor";

export interface ExpandedModelTagEditorProps<M extends Model.Model, V = M> extends _ExpandedModelTagsMenuProps<M> {
  readonly models: M[];
  readonly searchIndices: SearchIndicies;
  readonly editor: IEditor<M, V>;
  readonly selected: number | string | null;
  readonly onChange: (m: M, e: Table.CellDoneEditingEvent) => void;
}

const ExpandedModelTagEditor = <M extends Model.Model, V = M>(props: ExpandedModelTagEditorProps<M, V>) => {
  return (
    <ExpandedModelTagsMenu<M>
      selected={props.selected}
      defaultFocusOnlyItem={true}
      multiple={false}
      fillWidth={false}
      leftAlign={true}
      menuRef={props.editor.menuRef}
      autoFocusMenu={true}
      focusSearchOnCharPress={true}
      defaultFocusFirstItem={false}
      {...props}
      onChange={props.onChange}
      models={props.models}
      searchIndices={props.searchIndices}
    />
  );
};

export default ExpandedModelTagEditor;
