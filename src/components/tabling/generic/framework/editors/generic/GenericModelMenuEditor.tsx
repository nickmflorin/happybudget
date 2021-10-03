import classNames from "classnames";
import { ModelTagsMenu, ModelTagsMenuProps } from "components/menus";
import { IEditor } from "./useModelMenuEditor";

export interface GenericModelMenuEditorProps<
  V = ID,
  C extends Model.HttpModel = Model.HttpModel,
  R extends Table.RowData = Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> extends Table.EditorParams<R, M, S, V>,
    ModelTagsMenuProps<C>,
    StandardComponentProps {
  readonly searchIndices: SearchIndicies;
  readonly editor: IEditor<V, C, R, M, S>;
  readonly tagProps?: Omit<TagProps<C>, "children" | "model" | "text">;
}

/* eslint-disable indent */
const GenericModelMenuEditor = <
  C extends Model.HttpModel,
  V = ID,
  R extends Table.RowData = Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
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
