import React from "react";
import { ModelTagsMenu, ModelTagsMenuProps } from "components/menus";
import { IEditor } from "./useModelMenuEditor";

export interface GenericModelMenuEditorProps<
  V = ID,
  C extends Model.HttpModel = Model.HttpModel,
  R extends Table.RowData = Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> extends Table.EditorParams<R, M, S, V>,
    ModelTagsMenuProps<C, MenuItemSelectedState>,
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
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>(
  props: GenericModelMenuEditorProps<V, C, R, M, S>
) => {
  return (
    <ModelTagsMenu<C>
      clientSearching={true}
      {...props}
      menu={props.editor.menu}
      includeSearch={true}
      focusSearchOnCharPress={true}
    />
  );
};

export default React.memo(GenericModelMenuEditor) as typeof GenericModelMenuEditor;
