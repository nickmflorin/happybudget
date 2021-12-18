import React from "react";
import { ModelTagsMenu, ModelTagsMenuProps } from "components/menus";
import { IEditor } from "./useModelMenuEditor";

export interface GenericModelMenuEditorProps<
  V extends Table.RawRowValue,
  C extends Model.HttpModel,
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> extends Table.EditorParams<R, M, S, V | null>,
    ModelTagsMenuProps<C, MenuItemSelectedState>,
    StandardComponentProps {
  readonly searchIndices?: SearchIndicies;
  readonly editor: IEditor<V, C, R, M, S>;
  readonly tagProps?: Omit<TagProps<C>, "children" | "model" | "text">;
}

const GenericModelMenuEditor = <
  V extends Table.RawRowValue,
  C extends Model.HttpModel,
  R extends Table.RowData,
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
