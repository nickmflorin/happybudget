import { isNil } from "lodash";

import useModelMenuEditor from "./useModelMenuEditor";
import ExpandedModelTagEditor from "./ExpandedModelTagEditor";

export interface ChoiceEditorProps<R extends Table.Row, M extends Model.Model, C extends Model.Model>
  extends Table.EditorParams<R, M>,
    StandardComponentProps {
  readonly models: C[];
  readonly searchIndices: SearchIndicies;
  readonly tagProps?: TagProps<C>;
}

interface _ChoiceEditorProps<R extends Table.Row, M extends Model.Model, C extends Model.Model>
  extends ChoiceEditorProps<R, M, C> {
  /* eslint-disable react/no-unused-prop-types */
  forwardedRef: any;
}

const ChoiceEditor = <R extends Table.Row, M extends Model.Model, C extends Model.Model>({
  models,
  searchIndices,
  style,
  tagProps,
  ...props
}: _ChoiceEditorProps<R, M, C>) => {
  const [editor] = useModelMenuEditor<R, M, C>(props);

  return (
    <ExpandedModelTagEditor<C>
      className={props.className}
      editor={editor}
      searchIndices={searchIndices}
      style={style}
      selected={!isNil(editor.value) ? editor.value.id : null}
      onChange={(m: C, e: Table.CellDoneEditingEvent) => editor.onChange(m, e)}
      menuRef={editor.menuRef}
      models={models}
      tagProps={tagProps}
    />
  );
};

export default ChoiceEditor;
