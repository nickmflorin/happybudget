import Option, { OptionProps } from "./Option";

export type ModelSelectOptionProps<
  M extends Model.Model,
  Multi extends boolean = false,
  G extends SelectGroupBase<ModelSelectOption<M>> = SelectGroupBase<ModelSelectOption<M>>
> = OptionProps<ModelSelectOption<M>, Multi, G>;

const ModelSelectOption = <
  M extends Model.Model,
  Multi extends boolean = false,
  G extends SelectGroupBase<ModelSelectOption<M>> = SelectGroupBase<ModelSelectOption<M>>
>(
  props: ModelSelectOptionProps<M, Multi, G>
): JSX.Element => <Option {...props} />;

export default ModelSelectOption;
