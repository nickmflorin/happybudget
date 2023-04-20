// import { parseEnvVar } from "../../util";

/* import { FREE_ICON_REGISTRY } from "./freeRegistry";
   import { PRO_ICON_REGISTRY } from "./proRegistry";
   import { NaiveFAIconDefinition } from "./types"; */

// let IconRegistry: readonly NaiveFAIconDefinition[] = [];

/* const PRO_FONT_AWESOME = parseEnvVar(
     process.env.NEXT_PUBLIC_PRO_FONT_AWESOME,
     "NEXT_PUBLIC_PRO_FONT_AWESOME",
     { type: "boolean", required: true },
   ); */

/* if (PRO_FONT_AWESOME === true) {
     if (process.env.FONTAWESOME_NPM_AUTH_TOKEN === undefined) {
       throw new TypeError("'FONTAWESOME_NPM_AUTH_TOKEN' is not present in the environment.");
     }
     IconRegistry = PRO_ICON_REGISTRY;
   } else {
     IconRegistry = FREE_ICON_REGISTRY;
   } */

// export const ICON_REGISTRY = IconRegistry;

import { type IconLicense, IconCodes, type IconCode } from "./constants";
import { NaiveFAIconDefinition } from "./types";

const REGULAR_IMPORT_ICONS = [
  "faCircleQuestion",
  "faFileImage",
  "faFileVideo",
  "faFileAudio",
  "faFileArchive",
  "faFilePdf",
  "faFilePowerpoint",
  "faFileExcel",
  "faFileWord",
  "faFile",
  "faTrashAlt",
  "faBookOpen",
  "faFolderOpen",
  "faBook",
] as const;

type FontAwesomeRegularIconName = typeof REGULAR_IMPORT_ICONS[number];

const SOLID_IMPORT_ICONS = [
  "faArrowDown",
  "faArrowUp",
  "faDatabase",
  "faTriangleExclamation",
  "faCircleCheck",
  "faCircleExclamation",
  "faXmark",
  "faUserCircle",
  "faChevronDown",
  "faFileCsv",
  "faBank",
  "faFileImport",
  "faCircleNotch",
  "faServer",
  "faCaretDown",
  "faCaretUp",
  "faTimesCircle",
  "faPlusCircle",
  "faFilter",
  "faSortAmountDown",
  "faCameraAlt",
  "faCopy",
  "faUsers",
  "faAddressBook",
  "faFolderOpen",
  "faBookOpen",
  "faBook",
] as const;

const IMPORT_ICONS = {
  regular: REGULAR_IMPORT_ICONS,
  solid: SOLID_IMPORT_ICONS,
};

type FontAwesomeSolidIconName = typeof SOLID_IMPORT_ICONS[number];

type FontAwesomeIconName<T extends IconCode> = {
  regular: FontAwesomeRegularIconName;
  solid: FontAwesomeSolidIconName;
}[T];

type ModuleImport<T extends IconCode> = Record<FontAwesomeIconName<T>, NaiveFAIconDefinition>;

// import {faAddressBook} from "@fortawesome/free-regular-svg-icons"

const IMPORT_PATHS: { [key in Exclude<IconLicense, "both">]: Record<IconCode, string> } = {
  pro: {
    regular: "@fortawesome/pro-regular-svg-icons",
    solid: "@fortawesome/pro-solid-svg-icons",
  },
  free: {
    regular: "@fortawesome/free-regular-svg-icons",
    solid: "@fortawesome/free-solid-svg-icons",
  },
};

export type ImportedRegistry = NaiveFAIconDefinition[];

export const importRegistry = async (
  licenseType: Exclude<IconLicense, "both">,
): Promise<ImportedRegistry> =>
  IconCodes.__ALL__.reduce(async (prevPromise: Promise<ImportedRegistry>, code: IconCode) => {
    const path = IMPORT_PATHS[licenseType][code];
    const m: ModuleImport<typeof code> = await import(path);
    const prevImport = await prevPromise;
    return [
      ...prevImport,
      ...(IMPORT_ICONS[code].slice() as FontAwesomeIconName<typeof code>[]).reduce(
        (prevModuleRegistry: ImportedRegistry, name: FontAwesomeIconName<typeof code>) => {
          if (m[name] === undefined) {
            throw new Error("");
          }
          return [...prevModuleRegistry, m[name]];
        },
        [] as ImportedRegistry,
      ),
    ];
  }, Promise.resolve([] as ImportedRegistry));
