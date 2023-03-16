import { useMemo, useState } from "react";

import { isNil } from "lodash";

import { ui } from "lib";
import { Icon } from "components";
import { IconButton } from "components/buttons";

import Option, { OptionProps } from "./Option";

export type ModelSelectOptionProps<
  M extends Model.Model,
  Multi extends boolean = false,
  G extends SelectGroupBase<ModelSelectOption<M>> = SelectGroupBase<ModelSelectOption<M>>,
> = Omit<OptionProps<ModelSelectOption<M>, Multi, G>, "selectProps"> & {
  readonly selectProps: OptionProps<ModelSelectOption<M>, Multi, G>["selectProps"] & {
    readonly onDelete?: (id: M, cb: (v: boolean) => void) => Promise<void | null>;
    readonly optionCanDelete?: (m: M) => boolean;
  };
};

const ModelSelectOption = <
  M extends Model.Model,
  Multi extends boolean = false,
  G extends SelectGroupBase<ModelSelectOption<M>> = SelectGroupBase<ModelSelectOption<M>>,
>(
  props: ModelSelectOptionProps<M, Multi, G>,
): JSX.Element => {
  const [deleting, setDeleting] = useState(false);

  const extra = useMemo(() => {
    if (
      !isNil(props.selectProps.onDelete) &&
      (isNil(props.selectProps.optionCanDelete) ||
        props.selectProps.optionCanDelete(ui.select.toSelectModel(props.data)) === true)
    ) {
      return (
        <IconButton
          icon={<Icon icon="trash" weight="regular" />}
          iconSize="xsmall"
          loading={deleting}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            event.preventDefault();
            props.selectProps.onDelete?.(ui.select.toSelectModel(props.data), setDeleting);
          }}
        />
      );
    }
    return <></>;
  }, [props.selectProps.onDelete, props.selectProps.optionCanDelete, props.data, deleting]);

  return <Option {...props} extra={extra} />;
};

export default ModelSelectOption;
