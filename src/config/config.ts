import { reduce } from "lodash";
import * as flags from "./flags";

const ACCCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];
const MAX_IMAGE_SIZE = 2; // In MB

const ConfigOptions: Application.ConfigOption[] = [
  { name: "tableDebug", default: false, prodEnv: "local" },
  { name: "billingEnabled", prodEnv: "local" },
  { name: "tableRowOrdering", default: true },
  { name: "reportWebVitals", default: false, prodEnv: "local" },
  { name: "whyDidYouRender", default: false, prodEnv: "local" }
];

const Config: Application.Config = reduce(
  ConfigOptions,
  (curr: Application.Config, option: Application.ConfigOption) => ({
    ...curr,
    [option.name]: option.hardOverride === undefined ? flags.evaluateFlagFromEnvOrMemory(option) : option.hardOverride
  }),
  {
    acceptedImageTypes: ACCCEPTED_IMAGE_TYPES,
    maxImageSize: MAX_IMAGE_SIZE
  } as Application.Config
);

export default Config;
