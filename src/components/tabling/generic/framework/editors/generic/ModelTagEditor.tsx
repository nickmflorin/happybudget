import classNames from "classnames";
import { ModelTagsMenu, ModelTagsMenuProps } from "components/menus";
import { IEditor } from "./useModelMenuEditor";

export interface ModelTagEditorProps<R extends Table.Row, M extends Model.Model, C extends Model.Model, V = M>
  extends ModelTagsMenuProps<C> {
  readonly searchIndices: SearchIndicies;
  readonly editor: IEditor<R, M, C, V>;
}

const ModelTagEditor = <R extends Table.Row, M extends Model.Model, C extends Model.Model, V = C>(
  props: ModelTagEditorProps<R, M, C, V>
) => {
  return (
    <ModelTagsMenu<C>
      defaultFocusOnlyItem={true}
      menu={props.editor.menu}
      includeSearch={true}
      autoFocusMenu={true}
      clientSearching={true}
      focusSearchOnCharPress={true}
      defaultFocusFirstItem={false}
      {...props}
      className={classNames("table-menu", props.className)}
    />
  );
};

export default ModelTagEditor;
