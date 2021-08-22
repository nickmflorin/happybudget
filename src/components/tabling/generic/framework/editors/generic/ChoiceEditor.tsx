import { isNil } from "lodash";

import useModelMenuEditor from "./useModelMenuEditor";
import ModelTagEditor from "./ModelTagEditor";

export interface ChoiceEditorProps<R extends Table.Row, M extends Model.Model, C extends Model.Model>
  extends Table.EditorParams<R, M>,
    StandardComponentProps {
  readonly models: C[];
  readonly searchIndices: SearchIndicies;
  readonly tagProps?: Omit<TagProps<C>, "children" | "model" | "text">;
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
    <ModelTagEditor<C>
      className={props.className}
      editor={editor}
      searchIndices={searchIndices}
      includeSearch={true}
      style={style}
      selected={!isNil(editor.value) ? editor.value.id : []}
      onChange={(params: MenuChangeEvent<C>) => editor.onChange(params.model, params.event)}
      models={models}
      tagProps={tagProps}
    />
  );
};

export default ChoiceEditor;
