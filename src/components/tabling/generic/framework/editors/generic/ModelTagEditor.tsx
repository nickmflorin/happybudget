import classNames from "classnames";
import { ModelTagsMenu, ModelTagsMenuProps } from "components/menus";
import { IEditor } from "./useModelMenuEditor";

export interface ModelTagEditorProps<M extends Model.Model, V = M> extends ModelTagsMenuProps<M> {
  readonly searchIndices: SearchIndicies;
  readonly editor: IEditor<M, V>;
}

const ModelTagEditor = <M extends Model.Model, V = M>(props: ModelTagEditorProps<M, V>) => {
  return (
    <ModelTagsMenu<M>
      defaultFocusOnlyItem={true}
      menu={props.editor.menu}
      includeSearch={true}
      autoFocusMenu={true}
      focusSearchOnCharPress={true}
      defaultFocusFirstItem={false}
      {...props}
      className={classNames("table-menu", props.className)}
    />
  );
};

export default ModelTagEditor;
