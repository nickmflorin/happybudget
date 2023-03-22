export type SelectInstance = UINotificationsManager;

export type HeaderTemplateSelectInstance = SelectInstance & {
  readonly addOption: (m: Model.HeaderTemplate | Model.SimpleHeaderTemplate) => void;
};

export type SelectOption = {
  readonly icon?: IconOrElement;
};

export type ModelSelectOption<M extends Model.Model> = SelectOption &
  Omit<M, "id"> & {
    readonly id: string;
  };

export type SelectModel<M extends Model.Model> = SelectOption & M;

export type SelectGroupBase<O extends SelectOption> = import("react-select").GroupBase<O>;
