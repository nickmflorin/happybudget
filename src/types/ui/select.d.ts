type SelectErrorOption = {
  readonly message: string;
  readonly detail?: string;
  readonly isError: true;
};

type AsyncSelectOption<O> = O | SelectErrorOption;

type AsyncSelectGroupBase<O> = import("react-select").GroupBase<AsyncSelectOption<O>>;
