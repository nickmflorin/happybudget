declare type SelectInstance = UINotificationsManager;

declare type HeaderTemplateSelectInstance = SelectInstance & {
  readonly addOption: (m: Model.HeaderTemplate | Model.SimpleHeaderTemplate) => void;
};

declare type SelectOption = {
  readonly icon?: IconOrElement;
};

declare type ModelSelectOption<M extends Model.Model> = SelectOption &
  Omit<M, "id"> & {
    readonly id: string;
  };

declare type SelectModel<M extends Model.Model> = SelectOption & M;

declare type SelectGroupBase<O extends SelectOption> = import("react-select").GroupBase<O>;
