import { useMemo } from "react";
import AsyncSelect from "react-select/async";
import { map } from "lodash";

import { hooks } from "store";

import * as api from "api";

type CollaboratorSelectProps = {
  readonly currentCollaborators: Model.Collaborator[];
};

type Datum = { readonly label: string };

const CollaboratorSelect = ({ currentCollaborators }: CollaboratorSelectProps): JSX.Element => {
  const user = hooks.useLoggedInUser();

  const loadOptions = useMemo(
    () => (inputValue: string) => {
      return new Promise<Datum[]>((resolve, reject) => {
        api
          .searchUsers(inputValue, {
            exclude: [...map(currentCollaborators, (c: Model.Collaborator) => c.user.id), user.id]
          })
          .then((response: Http.ListResponse<Model.SimpleUser>) => {
            resolve(map(response.data, (u: Model.SimpleUser) => ({ label: u.full_name })));
          })
          .catch((e: Error) => {
            reject(e);
          });
      });
    },
    [user.id, currentCollaborators]
  );

  return <AsyncSelect cacheOptions={true} loadOptions={loadOptions} />;
};

export default CollaboratorSelect;
