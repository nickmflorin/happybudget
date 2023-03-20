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
import { enumeratedLiterals } from "lib/util/util";

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
  "slack",
  "arrow-down",
  "circle-notch",
  "ellipsis",
  "database",
  "chart-simple",
  "circle-nodes",
  "shield",
  "user-group",
  "triangle-exclamation",
  "file-lines",
  "circle-question",
  "circle-exclamation",
  "circle-check",
  "xmark",
  "circle-user",
  "bell",
  "chevron-down",
  "pencil",
  "pause",
  "arrow-rotate-left",
  "circle-stop",
  "play",
] as const);

/* When an Icon is added to the registry, the name must be added to the appropriate IconCode key
   in this object type. */
export const Icons = {
  [IconCodes.REGULAR]: [IconNames.FILE_LINES, IconNames.CIRCLE_QUESTION] as const,
  [IconCodes.SOLID]: [
    IconNames.CIRCLE_NOTCH,
    IconNames.CIRCLE_NODES,
    IconNames.SHIELD,
    IconNames.USER_GROUP,
    IconNames.TRIANGLE_EXCLAMATION,
    IconNames.CHART_SIMPLE,
    IconNames.DATABASE,
    IconNames.ARROW_DOWN,
    IconNames.ELLIPSIS,
    IconNames.CIRCLE_CHECK,
    IconNames.CIRCLE_EXCLAMATION,
    IconNames.XMARK,
    IconNames.CIRCLE_USER,
    IconNames.BELL,
    IconNames.CHEVRON_DOWN,
    IconNames.PENCIL,
    IconNames.PAUSE,
    IconNames.ARROW_ROTATE_LEFT,
    IconNames.CIRCLE_STOP,
    IconNames.PLAY,
  ] as const,
  [IconCodes.BRAND]: [IconNames.SLACK] as const,
};
