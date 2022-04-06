export const isSelectErrorOption = <O>(option: O | SelectErrorOption): option is SelectErrorOption =>
  (option as SelectErrorOption).isError === true;
