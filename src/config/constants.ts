export const Environments: Application.Environments = {
  APP: "app",
  DEV: "dev",
  LOCAL: "local",
  __ALL__: ["app", "dev", "local"],
  __NON_PROD__: ["dev", "local"],
  __REMOTE__: ["dev", "app"],
};
