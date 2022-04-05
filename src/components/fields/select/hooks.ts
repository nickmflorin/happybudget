import { useMemo } from "react";
import { find } from "lodash";

type ToModel<M extends Model.Model> = (m: Model.WithStringId<M>) => M;
type ToOption<M extends Model.Model> = (m: M) => Model.WithStringId<M>;

const toModel = <M extends Model.Model>(m: Model.WithStringId<M>): M => ({ ...m, id: parseInt(m.id) } as M);

const toOption = <M extends Model.Model>(m: M): Model.WithStringId<M> => ({ ...m, id: String(m.id) });

type UseModelSelectReturnType<M extends Model.Model> = {
  readonly toModel: ToModel<M>;
  readonly toOption: ToOption<M>;
  readonly retrieve: (id: M["id"] | null) => M | undefined;
};

export const useModelSelect = <M extends Model.Model>(source: M[]): UseModelSelectReturnType<M> => {
  const retrieve = useMemo(
    () =>
      (id: M["id"] | null): M | undefined => {
        const m: M | undefined = find(source, { id }) as M | undefined;
        if (m === undefined) {
          console.warn(`Could not parse select model from data for ID ${id}.`);
          return undefined;
        }
        return m;
      },
    [source]
  );
  return { toModel, toOption, retrieve };
};
