import ModelTagsMenu from "./ModelTagsMenu";

export interface OptionTagsMenuProps<I extends number, N extends string, M extends ChoiceModel<I, N>>
  extends StandardComponentProps {
  models: M[];
  onChange: (value: I) => void;
}

const OptionTagsMenu = <I extends number, N extends string, M extends ChoiceModel<I, N> = ChoiceModel<I, N>>({
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
