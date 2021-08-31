import { redux } from "lib";

export const selectTemplateId = (state: Application.Authenticated.Store) => state.template.id;
export const selectTemplateDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.template.detail.data
);
export const selectTemplateDetailLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Application.Authenticated.Store) => state.template.detail.loading
);
