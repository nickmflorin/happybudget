import classNames from "classnames";
import { ModelTagsMenu, ModelTagsMenuProps } from "components/menus";
import { IEditor } from "./useModelMenuEditor";

export interface GenericModelMenuEditorProps<
  V = ID,
  C extends Model.Model = Model.Model,
  R extends Table.RowData = Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
> extends Table.EditorParams<R, M, G, S, V>,
    ModelTagsMenuProps<C>,
    StandardComponentProps {
  readonly searchIndices: SearchIndicies;
  readonly editor: IEditor<V, C, R, M, G, S>;
  readonly tagProps?: Omit<TagProps<C>, "children" | "model" | "text">;
}

/* eslint-disable indent */
const GenericModelMenuEditor = <
  C extends Model.Model,
  V = ID,
  R extends Table.RowData = Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
>(
  props: GenericModelMenuEditorProps<V, C, R, M, G, S>
) => {
  return (
    <ModelTagsMenu<C>
      {...props}
      defaultFocusOnlyItem={true}
      menu={props.editor.menu}
      includeSearch={true}
      autoFocusMenu={true}
      clientSearching={true}
      focusSearchOnCharPress={true}
      defaultFocusFirstItem={false}
      className={classNames("table-menu", props.className)}
    />
  );
};

export default GenericModelMenuEditor;
