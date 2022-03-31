import { useMemo } from "react";
import AsyncSelect from "react-select/async";
import { MultiValue } from "react-select/dist/declarations/src/types";
import classNames from "classnames";
import { map } from "lodash";

import { hooks } from "store";

import * as api from "api";

type CollaboratorSelectProps = {
  readonly currentCollaborators: Model.Collaborator[];
  readonly className?: string;
  readonly onChange?: (userIds: number[]) => void;
};

type Datum = { readonly label: string; readonly id: number };

const CollaboratorSelect = ({ currentCollaborators, ...props }: CollaboratorSelectProps): JSX.Element => {
  const user = hooks.useLoggedInUser();

  const loadOptions = useMemo(
    () => (inputValue: string) => {
      return new Promise<Datum[]>((resolve, reject) => {
        api
          .searchUsers(inputValue, {
            exclude: [...map(currentCollaborators, (c: Model.Collaborator) => c.user.id), user.id]
          })
          .then((response: Http.ListResponse<Model.SimpleUser>) => {
            resolve(map(response.data, (u: Model.SimpleUser) => ({ label: u.full_name, id: u.id })));
          })
          .catch((e: Error) => {
            reject(e);
          });
      });
    },
    [user.id, currentCollaborators]
  );

  return (
    <AsyncSelect
      {...props}
      className={classNames("react-select-container", props.className)}
      classNamePrefix={"react-select"}
      cacheOptions={true}
      loadOptions={loadOptions}
      isMulti={true}
      onChange={(newValue: MultiValue<Datum>) => props.onChange?.(map(newValue, (d: Datum) => d.id))}
    />
  );
};

export default CollaboratorSelect;
