import ModelTagsMenu from "./ModelTagsMenu";

export interface OptionTagsMenuProps<I extends number, N extends string, M extends OptionModel<I, N>>
  extends StandardComponentProps {
  models: M[];
  onChange: (value: I) => void;
}

const OptionTagsMenu = <I extends number, N extends string, M extends OptionModel<I, N> = OptionModel<I, N>>({
  /* eslint-disable indent */
  onChange,
  models,
  className,
  style = {}
}: OptionTagsMenuProps<I, N, M>): JSX.Element => {
  return (
    <ModelTagsMenu<M>
      onChange={(m: M) => onChange(m.id)}
      models={models}
      className={className}
      style={style}
      labelField={"name"}
      multiple={false}
    />
  );
};

export default OptionTagsMenu;
