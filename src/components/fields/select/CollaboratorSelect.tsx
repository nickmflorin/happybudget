import React from "react";
import { map } from "lodash";
import classNames from "classnames";

import * as api from "api";
import { hooks } from "store";
import { http, ui } from "lib";

import { UserImageOrInitials } from "components/images";

import AsyncOption, { AsyncOptionProps } from "./AsyncOption";
import { OptionChildrenRenderProps } from "./Option";
import MultiModelAsyncSelect, { MultiModelAsyncSelectProps } from "./MultiModelAsyncSelect";

export type CollaboratorSelectProps = Omit<
  MultiModelAsyncSelectProps<Model.SimpleUser>,
  "loadOptions" | "getOptionLabel" | "noOptionsMessage" | "components"
> & {
  readonly currentCollaborators: Model.Collaborator[];
};

const Option = <G extends AsyncSelectGroupBase<ModelSelectOption<Model.SimpleUser>>>(
  props: AsyncOptionProps<ModelSelectOption<Model.SimpleUser>, true, G>
) =>
  ui.select.isSelectErrorOption(props.data) ? (
    <AsyncOption<ModelSelectOption<Model.SimpleUser>, true, G> {...props} />
  ) : (
    <AsyncOption {...props} className={classNames("collaborator-select-option", props.className)}>
      <React.Fragment>
        {(params: OptionChildrenRenderProps<ModelSelectOption<Model.SimpleUser>, true>) => (
          <React.Fragment>
            <div className={"user-image-or-initials-container"}>
              <UserImageOrInitials circle={true} user={{ ...params.data, id: parseInt(params.data.id) }} />
            </div>
            <div className={"name-container"}>{params.data.full_name}</div>
          </React.Fragment>
        )}
      </React.Fragment>
    </AsyncOption>
  );

const MemoizedOption = React.memo(Option) as typeof Option;

const CollaboratorSelect = ({ currentCollaborators, ...props }: CollaboratorSelectProps): JSX.Element => {
  const user = hooks.useLoggedInUser();
  const [cancelToken] = http.useCancelToken();

  return (
    <MultiModelAsyncSelect
      placeholder={"Search users..."}
      {...props}
      components={{ Option: MemoizedOption }}
      noOptionsMessage={() => "No users found."}
      loadOptions={(inputValue: string) =>
        api.searchUsers(
          inputValue,
          { exclude: [...map(currentCollaborators, (c: Model.Collaborator) => c.user.id), user.id] },
          { cancelToken: cancelToken() }
        )
      }
      getOptionLabel={(m: Model.SimpleUser) => m.full_name}
    />
  );
};

export default React.memo(CollaboratorSelect);
