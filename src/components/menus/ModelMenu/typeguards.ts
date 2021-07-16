export const isMultipleModelMenuProps = <M extends Model.M>(
  data: ModelMenuProps<M>
): data is MultipleModelMenuProps<M> & _ModelMenuProps<M> => {
  return (data as MultipleModelMenuProps<M> & _ModelMenuProps<M>).multiple === true;
};

export const isModelWithChildren = <M extends Model.M>(model: M): model is M & { children: M[] } => {
  return (
    (model as M & { children: M[] }).children !== undefined && Array.isArray((model as M & { children: M[] }).children)
  );
};
