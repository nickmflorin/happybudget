import React from "react";
import { map } from "lodash";
import { components, OptionProps, MultiValueProps } from "react-select";
import classNames from "classnames";

import * as api from "api";
import { http, ui } from "lib";
import { EntityText } from "components/typography";

import AsyncOption from "./AsyncOption";
import AsyncMultiValue from "./AsyncMultiValue";
import MultiModelAsyncSelect, { MultiModelAsyncSelectProps } from "./MultiModelAsyncSelect";

export type ChildrenSelectProps<M extends Model.SimpleAccount | Model.SimpleSubAccount> = Omit<
  MultiModelAsyncSelectProps<M>,
  "loadOptions" | "getOptionLabel" | "components"
> & {
  readonly parentId: number;
  readonly parentType: Model.ParentType;
};

const MultiValue = <
  M extends Model.SimpleAccount | Model.SimpleSubAccount,
  G extends AsyncSelectGroupBase<AsyncModelSelectOption<M>>
>(
  props: MultiValueProps<AsyncSelectOption<AsyncModelSelectOption<M>>, true, G>
) => {
  return ui.select.isSelectErrorOption(props.data) ? (
    <AsyncMultiValue {...props} />
  ) : (
    <components.MultiValue {...props}>
      <EntityText fillEmpty={"----"}>{ui.select.toSelectModel<M>(props.data)}</EntityText>
    </components.MultiValue>
  );
};

const MemoizedMultiValue = React.memo(MultiValue) as typeof MultiValue;

const Option = <
  M extends Model.SimpleAccount | Model.SimpleSubAccount,
  G extends AsyncSelectGroupBase<AsyncModelSelectOption<M>>
>(
  props: OptionProps<AsyncSelectOption<AsyncModelSelectOption<M>>, true, G>
) => {
  return ui.select.isSelectErrorOption(props.data) ? (
    <AsyncOption {...props} />
  ) : (
    <components.Option {...props} className={classNames("child-select-option", props.className)}>
      <EntityText fillEmpty={"----"}>{ui.select.toSelectModel<M>(props.data)}</EntityText>
    </components.Option>
  );
};

const MemoizedOption = React.memo(Option) as typeof Option;

const ChildrenSelect = <M extends Model.SimpleAccount | Model.SimpleSubAccount>({
  parentId,
  parentType,
  ...props
}: ChildrenSelectProps<M>): JSX.Element => {
  const [cancelToken] = http.useCancelToken();
  return (
    <MultiModelAsyncSelect
      placeholder={"Search accounts..."}
      {...props}
      isSearchable={false}
      components={{ Option: MemoizedOption, MultiValue: MemoizedMultiValue }}
      noOptionsMessage={() => "No accounts found."}
      processResponse={(rsp: Http.ListResponse<M>) => map(rsp.data, (d: M) => ui.select.toModelSelectOption(d))}
      loadOptions={() =>
        api.getTableChildren<M>(parentId, parentType, { simple: true }, { cancelToken: cancelToken() })
      }
    />
  );
};

export default React.memo(ChildrenSelect) as typeof ChildrenSelect;
