import React from "react";
import { map } from "lodash";
import { components, OptionProps, MultiValueProps } from "react-select";
import classNames from "classnames";

import * as api from "api";
import { http, ui } from "lib";
import { EntityTextTag } from "components/tagging";
import { EntityText } from "components/typography";

import { AsyncOption, AsyncMultiValue } from "./AsyncSelect";
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
  G extends AsyncSelectGroupBase<Model.WithStringId<M>>
>(
  props: MultiValueProps<AsyncSelectOption<Model.WithStringId<M>>, true, G>
) => {
  return ui.isSelectErrorOption(props.data) ? (
    <AsyncMultiValue {...props} />
  ) : (
    <components.MultiValue {...props}>
      <EntityTextTag>{ui.toSelectModel(props.data)}</EntityTextTag>
    </components.MultiValue>
  );
};

const Option = <
  M extends Model.SimpleAccount | Model.SimpleSubAccount,
  G extends AsyncSelectGroupBase<Model.WithStringId<M>>
>(
  props: OptionProps<AsyncSelectOption<Model.WithStringId<M>>, true, G>
) => {
  return ui.isSelectErrorOption(props.data) ? (
    <AsyncOption {...props} />
  ) : (
    <components.Option {...props} className={classNames("child-select-option", props.className)}>
      <EntityText fillEmpty={"----"}>{ui.toSelectModel(props.data)}</EntityText>
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
      components={{ Option: MemoizedOption, MultiValue }}
      noOptionsMessage={() => "No accounts found."}
      processResponse={(rsp: Http.ListResponse<M>) => map(rsp.data, (d: M) => ui.toSelectOption(d))}
      loadOptions={() =>
        api.getTableChildren<M>(parentId, parentType, { simple: true }, { cancelToken: cancelToken() })
      }
    />
  );
};

export default React.memo(ChildrenSelect) as typeof ChildrenSelect;
