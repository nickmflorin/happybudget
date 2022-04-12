type SelectInstance = UINotificationsManager;

type SelectOption = {
  readonly icon?: IconOrElement;
};

type ModelSelectOption<M extends Model.Model> = SelectOption &
  Omit<M, "id"> & {
    readonly id: string;
  };

type SelectModel<M extends Model.Model> = SelectOption & M;

type SelectGroupBase<O extends SelectOption> = import("react-select").GroupBase<O>;
