import React from "react";
import { map } from "lodash";

import * as api from "api";
import { http, ui } from "lib";

import { options, multivalue, MultiModelAsyncSelect, MultiModelAsyncSelectProps } from "./generic";

export type ChildrenSelectProps<M extends Model.SimpleAccount | Model.SimpleSubAccount> = Omit<
  MultiModelAsyncSelectProps<M>,
  "loadOptions" | "getOptionLabel" | "components"
> & {
  readonly parentId: number;
  readonly parentType: Model.ParentType;
};

const ChildrenSelect = <M extends Model.SimpleAccount | Model.SimpleSubAccount>({
  parentId,
  parentType,
  ...props
}: ChildrenSelectProps<M>): JSX.Element => {
  const [cancelToken] = http.useCancelToken();
  return (
    <MultiModelAsyncSelect<M>
      placeholder={"Search accounts..."}
      {...props}
      isSearchable={false}
      components={{ Option: options.EntityTextOption, MultiValue: multivalue.EntityTextMultiValue }}
      noOptionsMessage={() => "No accounts found."}
      processResponse={(rsp: Http.ListResponse<M>) => map(rsp.data, (d: M) => ui.select.toModelSelectOption(d))}
      loadOptions={() =>
        api.getTableChildren<M>(parentId, parentType, { simple: true }, { cancelToken: cancelToken() })
      }
    />
  );
};

export default React.memo(ChildrenSelect) as typeof ChildrenSelect;
