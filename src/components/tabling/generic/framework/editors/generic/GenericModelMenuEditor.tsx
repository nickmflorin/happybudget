import classNames from "classnames";
import { ModelTagsMenu, ModelTagsMenuProps } from "components/menus";
import { IEditor } from "./useModelMenuEditor";

export interface GenericModelMenuEditorProps<
  V = ID,
  C extends Model.Model = Model.Model,
  R extends Table.RowData = Table.RowData,
  M extends Model.Model = Model.Model,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
> extends Table.EditorParams<R, M, S, V>,
    ModelTagsMenuProps<C>,
    StandardComponentProps {
  readonly searchIndices: SearchIndicies;
  readonly editor: IEditor<V, C, R, M, S>;
  readonly tagProps?: Omit<TagProps<C>, "children" | "model" | "text">;
}

/* eslint-disable indent */
const GenericModelMenuEditor = <
  C extends Model.Model,
  V = ID,
  R extends Table.RowData = Table.RowData,
  M extends Model.Model = Model.Model,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
>(
  props: GenericModelMenuEditorProps<V, C, R, M, S>
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
