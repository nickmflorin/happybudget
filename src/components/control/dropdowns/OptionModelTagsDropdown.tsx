import ModelTagsDropdown from "./ModelTagsDropdown";

interface OptionTagsDropdownProps<I extends number, N extends string, M extends OptionModel<I, N> = OptionModel<I, N>> {
  value: I | null;
  className?: string;
  trigger?: ("click" | "hover" | "contextMenu")[];
  onChange: (value: I) => void;
  models: M[];
}

const OptionsTagDropdown = <I extends number, N extends string, M extends OptionModel<I, N> = OptionModel<I, N>>({
  /* eslint-disable indent */
  value,
  models,
  className,
  onChange,
  trigger = ["click"]
}: OptionTagsDropdownProps<I, N, M>): JSX.Element => {
  return (
    <ModelTagsDropdown<M, I>
      value={value}
      onChange={(v: M) => onChange(v.id)}
      className={className}
      labelField={"name"}
      trigger={trigger}
      models={models}
      multiple={false}
    />
  );
};

export default OptionsTagDropdown;
