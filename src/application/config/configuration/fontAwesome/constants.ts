/*
The type bindings related to icons in the application are all derived from the values defined in
this file, and if they are not properly updated when Icons are added or removed - the type
definitions will not be valid.  In this case, the application will not start - because the
validation logic will throw an Error during the icon registration process.

(1) Adding an Icon: If the Icon is not added to the proper constants in this file, the TS bindings
    will not allow the application to compile because the Icon component will not recognize the
    provided name or prop as a valid specification of an Icon in the registered library.  Luckily,
    the validation logic will throw an Error before the application is allowed to start. To fix
    this, follow these steps:

    i. Import the icon from the correct @fortawesome package and include the imported icon in the
       `IconRegistry` array.

   ii. Add the string name of the icon being added to the `IconNames` array.

        ***
        It is possible that an icon with the same name will be imported multiple times, from
        different @fortawesome packages.  In this case, the name does not need to be re-added to
        the `IconNames` array (the array should be unique) - but step (iii) is still required.
        Cases where there are multiple icons imported with the same name should be obvious, because
        the JS icon object that is imported will be named the same and alias imports will have to
        be used:

        import { faArrowDown } from "@fortawesome/free-solid-svg-icons";
        import { faArrowDown as faArrowDownRegular } from "@fortawesome/free-regular-svg-icons";
        ***

  iii. Depending on the @fortawesome package that the icon was imported from, add the constant
       string name from step (ii) to the `Icons` object under the appropriate code that is
       associated with the @fortawesome package the icon was imported from.  Note that this still
       needs to be done even if the name is already present for another code.

(2) Removing an Icon: If the Icon is removed from the global registry, (i.e. it is no longer
    imported and included in the `IconRegistry` array), the application will not start because
    an error will be thrown in the validation logic during the icon registration process. To fix
    this, follow these steps:

    i. Determine whether or not the icon name associated with the icon being removed is used for
       multiple imported icons.  If it is not, remove the icon name from the `IconNames` array -
       otherwise, proceed to step (ii).

   ii. Remove the icon name from the `Icons` object under the appropriate code that is associated
       with the icon being removed.
*/
/* eslint-disable-next-line no-restricted-imports -- This is a special case to avoid circular imports. */
import { enumeratedLiterals } from "lib/util/literals";
/* eslint-disable-next-line no-restricted-imports -- This is a special case to avoid circular imports. */
import { EnumeratedLiteralType } from "lib/util/types/literals";

export const IconPrefixes = enumeratedLiterals(["far", "fab", "fas"] as const);

/**
 * An {@link IconCode} represents a more intuitive, human readable form of the FontAwesome prefix
 * values.  For instance, "far" corresponds to the "regular" FontAwesome library, so the code is
 * "regular".
 */
export const IconCodes = enumeratedLiterals(["solid", "regular", "brand"] as const);

/* When an Icon is added to the registry, the name must be added to this array.  If the name already
   exists, it is because the Icon's name is associated with multiple prefixes and the name does not
   need to be re-added to this array a second time.  This array should be unique. */
export const IconNames = enumeratedLiterals([
  "arrow-down",
  "arrow-up",
  "ellipsis",
  "database",
  "circle-question",
  "circle-exclamation",
  "circle-check",
  "xmark",
  "circle-user",
  "chevron-down",
  "file-csv",
  "file-excel",
  "file-pdf",
  "file-powerpoint",
  "file-word",
  "file-image",
  "file-audio",
  "file-video",
  "file-archive",
  "file",
  "bank",
  "file-import",
  "circle-notch",
  "server",
  "caret-down",
  "caret-up",
  "times-circle",
  "plus-circle",
  "trash-alt",
  "filter",
  "sort-amount-down",
  "camera-alt",
  "folder-open",
  "copy",
  "users",
  "book-open",
  "address-book",
  "book",
] as const);

export const IconLicenses = enumeratedLiterals(["free", "pro", "both"] as const);
export type IconLicense = EnumeratedLiteralType<typeof IconLicenses>;

export type LicensedIcon<
  N extends string,
  LICENSE extends IconLicense = "both",
> = LICENSE extends IconLicense
  ? {
      readonly name: N;
      readonly license: LICENSE;
    }
  : never;

export function licensedIcon<N extends string>(name: N): LicensedIcon<N, "both">;
export function licensedIcon<N extends string, LICENSE extends IconLicense = "both">(
  name: N,
  license: LICENSE,
): LicensedIcon<N, LICENSE>;
export function licensedIcon<N extends string, LICENSE extends IconLicense = "both">(
  name: N,
  license?: LICENSE,
): LicensedIcon<N, LICENSE> {
  if (license === undefined) {
    return { name, license: IconLicenses.BOTH } as LicensedIcon<N, LICENSE>;
  }
  return { name, license } as LicensedIcon<N, LICENSE>;
}

/* When an Icon is added to the registry, the name must be added to the appropriate IconCode key
   in this object type. */
export const Icons = {
  [IconCodes.REGULAR]: [
    IconNames.CIRCLE_QUESTION,
    IconNames.FILE_ARCHIVE,
    IconNames.FILE_AUDIO,
    IconNames.FILE_EXCEL,
    IconNames.FILE_IMAGE,
    IconNames.FILE_PDF,
    IconNames.FILE_POWERPOINT,
    IconNames.FILE_VIDEO,
    IconNames.FILE_WORD,
    IconNames.FILE,
    IconNames.TRASH_ALT,
    IconNames.FOLDER_OPEN,
    licensedIcon(IconNames.BOOK_OPEN, IconLicenses.PRO),
    licensedIcon(IconNames.BOOK, IconLicenses.PRO),
  ] as const,
  [IconCodes.SOLID]: [
    IconNames.DATABASE,
    IconNames.ARROW_DOWN,
    IconNames.ELLIPSIS,
    IconNames.CIRCLE_CHECK,
    IconNames.CIRCLE_EXCLAMATION,
    IconNames.XMARK,
    IconNames.CIRCLE_USER,
    IconNames.CHEVRON_DOWN,
    IconNames.FILE_CSV,
    IconNames.BANK,
    IconNames.FILE_IMPORT,
    IconNames.CIRCLE_NOTCH,
    IconNames.SERVER,
    IconNames.CARET_UP,
    IconNames.CARET_DOWN,
    IconNames.TIMES_CIRCLE,
    IconNames.PLUS_CIRCLE,
    IconNames.FILTER,
    IconNames.SORT_AMOUNT_DOWN,
    IconNames.BOOK_OPEN,
    IconNames.ADDRESS_BOOK,
    IconNames.USERS,
    IconNames.COPY,
    IconNames.FOLDER_OPEN,
    IconNames.CAMERA_ALT,
    IconNames.BOOK,
  ] as const,
  [IconCodes.BRAND]: [] as const,
};
