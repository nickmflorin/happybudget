type SelectOption = {
  readonly icon?: IconOrElement;
};

type SelectErrorOption = SelectOption & {
  readonly message: string;
  readonly detail?: string;
  readonly isError: true;
};

type ModelSelectOption<M extends Model.Model> = SelectOption &
  Omit<M, "id"> & {
    readonly id: string;
  };

/* type ModelSelectErrorOption = SelectErrorOption & {
     readonly id: "error";
   }; */

type SelectModel<M extends Model.Model> = SelectOption & M;

type SelectGroupBase<O extends SelectOption> = import("react-select").GroupBase<O>;

type AsyncSelectOption<O extends SelectOption> = O | SelectErrorOption;

type AsyncModelSelectOption<M extends Model.Model> = AsyncSelectOption<ModelSelectOption<M>>;

type AsyncSelectGroupBase<O extends SelectOption> = SelectGroupBase<AsyncSelectOption<O>>;
