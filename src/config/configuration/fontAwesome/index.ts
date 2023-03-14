/*
Re: Configuring Font Awesome

Dynamic Loading & Configuration
-------------------------------
The size of the "@fortawesome/fontawesome-svg-core" package is very significant, and since that
package is used when rendering Icons in the Sidebar on the initial page load (and we configure FA
on the initial page load) the size of the initial bundle sent to the browser will be very large as
a result.

To avoid this, we allow the configuration to be dynamically imported and asynchronously performed
such that the `<AppConfig />` component can dynamically perform the configuration routines while
avoiding a direct import from "@fortawesome/fontawesome-svg-core" and decrease the overall size of
the bundle sent to the browser on the initial page load.

Because we cannot directly import from "@fortawesome/fontawesome-svg-core" due to its size, there
are certain types that we would otherwise import from that package but instead have to be "stubbed"
out to remove their reliances on the "@fortawesome/fontawesome-svg-core" package import.

Note: The synchronous form of the `configure` method is still provided such that it can be used
for test setup and teardown, but the `configureAsync` method will be run when the application is
being loaded in a non-test environment.

NextJS CSS Loading
------------------
Since Next.js manages CSS differently than most web projects, if you just follow the plain vanilla
documentation to integrate react-fontawesome into the NextJS project we will see huge   This
is because the icons are missing the accompanying CSS that makes them behave.

In order for this to work with NextJS, we have to manually import the FontAwesome styles in the
`pages/_app.tsx` file, and then set `autoAddCss` to false so that the FontAwesome core SVG library
will not try to insert <style> elements into the <head> of the page - NextJS blocks this
automatically.

See: https://fontawesome.com/docs/web/use-with/react/use-with#getting-font-awesome-css-to-work

Global Icon Library
-------------------
When we configure FontAwesome, we need to register the Icons that we want to use in the application
with the global library.  This allows us to dramatically reduce the bundle size because we are not
including every icon from every "@fortawesome/free-<type>-svg-icons" package - just the ones we
need.

This is done inside of the `configure` method.

Even though this takes a millisecond (its very quick) - it still causes issues with NextJS:
  Error: Hydration failed because the initial UI does not match what was rendered on the server.

See: https://nextjs.org/docs/messages/react-hydration-error

We see this error when using a specific library or application code in a component that is relying
on something that could differ between pre-rendering and the browser - which in our case is the
registration of the icons to the global library.

To fix this, we can either:

(a) Wrap the <FontAwesomeIcon /> return in the <Icon /> component in a state variable that is set
    inside of a useEffect().  This is what NextJS's documentation suggests, but in their case it
    is a simple variable, not a variable that depends on all of the props - so it cannot work in
    this case.

(b) Simply use the "require" method of importing the { library } from FontAwesome, rather than
    import statements.  I do not know why this works, but it does.

See https://github.com/FortAwesome/Font-Awesome/issues/19348
*/
/* eslint-disable-next-line no-restricted-imports -- This is a special case to avoid circular imports. */
import { getIconCode } from "lib/ui/icons/util";
/* eslint-disable-next-line no-restricted-imports -- This is a special case to avoid circular imports. */
import { findDuplicates } from "lib/util/arrays";

import { Icons, IconNames, IconPrefixes } from "./constants";
import { NaiveFAIconDefinition, NaiveFAConfig } from "./types";

/**
 * Represents the dynamically imported content required to configure Font Awesome.  These options
 * are only provided to the `configure` method when the `configure` method is being called from an
 * asynchronous context.
 */
type ConfigurationOptions = {
  registry: NaiveFAIconDefinition[];
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  library: any;
  config: NaiveFAConfig;
};

type IconValidationError = { prefix?: string; iconName?: string; error: string };

/**
 * Synchronously configures the application with FontAwesome.
 *
 * All icons in the registry (i.e. the icons that we use in the application) are first validated
 * to ensure type-safe usage and are subsequently loaded into the FontAwesome global library.
 *
 * The method exposes an `__options__` argument that should be used when the method is being called
 * from an asynchronous context and the content required to configure FontAwesome is dynamically
 * imported.
 *
 * Note About Validation
 * ---------------------
 * The constants in `src/config/fontAwesome/registry` are used to derive icon-related types, which
 * in turn are used to restrict icon rendering in the application such that it does not fail.  If
 * this validation is not performed, we would not be able to reliably use TypeScript to prevent
 * usage of icons that no longer exist, or exist but are being used in a context that they were not
 * imported for.
 *
 * Because the constants defined in `src/config/fontAwesome/registry` are used to derive the types
 * that are responsible for preventing cases where the <Icon /> component will fail or not properly
 * render, it is very, very important that they be validated before the application starts - when
 * configuring FontAwesome.
 *
 * @param {ConfigurationOptions} __options__
 *   Dynamically imported content that is required to configure FontAwesome when the configuration
 *   is being performed in an asynchronous context.
 */
export const configure = (__options__?: ConfigurationOptions) => {
  /* If the configuration method is being called from the asynchronous context, the library, config
     and registry will have been dynamically imported already and provided to the method.  If the
     configuration method is not being called from the asynchronous context, we have to use require
     statements. */
  let library: ConfigurationOptions["library"];
  let config: ConfigurationOptions["config"];
  let registry: ConfigurationOptions["registry"];

  if (__options__ !== undefined) {
    library = __options__.library;
    config = __options__.config;
    registry = __options__.registry;
  } else {
    /* eslint-disable-next-line @typescript-eslint/no-var-requires */
    library = require("@fortawesome/fontawesome-svg-core").library;
    /* eslint-disable-next-line @typescript-eslint/no-var-requires */
    config = require("@fortawesome/fontawesome-svg-core").config;
    /* eslint-disable-next-line @typescript-eslint/no-var-requires */
    registry = require("./registry").IconRegistry;
  }

  config.autoAddCss = false;

  const iconsMapCodes = (name: string): string[] =>
    Object.keys(Icons).reduce((curr: string[], k: string) => {
      if ((Icons as { [key: string]: readonly string[] })[k].includes(name)) {
        return [...curr, k];
      }
      return curr;
    }, []);

  const iconsMapHasName = (name: string): boolean => iconsMapCodes(name).length !== 0;

  /* First, verify that there are no IconName values in the `IconNames` array that are no longer in
     the registry and thus no longer included in the library of FontAwesome icons we support.  If
     we do not check this, TypeScript will treat an IconName associated with an Icon that will not
     render as being valid. */
  let errors: IconValidationError[] = IconNames.__ALL__.reduce(
    (prev: IconValidationError[], name: import("lib/ui/icons/types").IconName) => {
      if (!registry.map((i: NaiveFAIconDefinition) => i.iconName).includes(name)) {
        return [
          ...prev,
          {
            iconName: name,
            error: `The icon name '${name}' is no longer associated with a registered icon.`,
          },
        ];
      }
      return prev;
    },
    [],
  );
  /* Second, verify that there are no IconPrefix values in the `IconPrefixes` array that are no
     longer in the registry and thus no longer included in the library of FontAwesome icons we
     support. */
  errors = IconPrefixes.__ALL__.reduce(
    (prev: IconValidationError[], prefix: string): IconValidationError[] => {
      if (!registry.map((i: NaiveFAIconDefinition) => i.prefix).includes(prefix)) {
        return [
          ...prev,
          {
            prefix,
            error: `The icon prefix '${prefix}' is no longer associated with any registered Icon.`,
          },
        ];
      }
      return prev;
    },
    errors,
  );

  /* Finally, verify that each Icon in the global registry is properly represented in the
    `IconNames` array, the `IconPrefixes` array, and the `Icons` object - which simply maps the
    values from the `IconNames` array to their corresponding prefix, or code. */
  errors = registry.reduce((prev: IconValidationError[], icon: NaiveFAIconDefinition) => {
    let error: string | null = null;
    if (!IconPrefixes.contains(icon.prefix)) {
      error = `The icon '${icon.prefix}' is not included in the 'IconPrefixes' array.`;
    } else if (!IconNames.contains(icon.iconName)) {
      error = `The icon '${icon.iconName}' is not included in the 'IconNames' array.`;
    } else if (!iconsMapHasName(icon.iconName)) {
      error = `The icon, '${icon.iconName}', is not included in the 'Icons' object.`;
    } else if (
      !iconsMapCodes(icon.iconName).includes(
        getIconCode(icon.prefix as import("lib/ui/icons/types").IconPrefix),
      )
    ) {
      error = `The icon, '${icon.iconName}', is registered, but not with the code '${getIconCode(
        icon.prefix as import("lib/ui/icons/types").IconPrefix,
      )}', but with code(s) '${iconsMapCodes(icon.iconName)}'.`;
    }
    return error === null
      ? prev
      : [...prev, { error, prefix: icon.prefix, iconName: icon.iconName }];
  }, errors);

  // Make sure that there are no duplicate IconName(s) referenced.
  errors = [
    ...errors,
    ...findDuplicates(IconNames.__ALL__.slice()).map((iconName: string) => ({
      iconName,
      error: `The icon name ${iconName} is present multiple times in the 'IconNames' array.`,
    })),
  ];

  // Make sure there are no duplicate Icons being loaded into the registry.
  errors = [
    ...errors,
    ...findDuplicates<{ prefix: string; iconName: string }>(
      registry.slice() as { prefix: string; iconName: string }[],
      (a: { prefix: string; iconName: string }, b: { prefix: string; iconName: string }) =>
        a.iconName === b.iconName && a.prefix === b.prefix,
    ).map((icon: { prefix: string; iconName: string }) => ({
      iconName: icon.iconName,
      iconPrefix: icon.prefix,
      error: `The icon with name '${icon.iconName}' and prefix '${icon.prefix}' is present multiple times in the registry.`,
    })),
  ];

  /* If there are errors present, we need to stop the application from starting - because these
     errors will not be caught by TypeScript and will break the application when a page is loaded
     with the invalid icons present. */
  if (errors.length !== 0) {
    const message =
      `Icon registry cannot load, there was/were ${errors.length} error(s): \n` +
      errors
        .map((e: IconValidationError, i: number) =>
          e.prefix !== undefined
            ? e.iconName !== undefined
              ? `(${i + 1}) [prefix = '${e.prefix}', name = '${e.iconName}'] ${e.error}`
              : `(${i + 1}) [prefix = '${e.prefix}'] ${e.error}`
            : `(${i + 1}) ${e.error}`,
        )
        .join("\n");
    throw new Error(message);
  }
  /* Add the validated, registered icons to the global Font Awesome library.  At this point, it is
     guaranteed that the type bindings related to Icons are correct, because they stem from constant
     definitions that were validated above. */
  library.add(...registry);
};

/**
 * Asynchronously configures the application with FontAwesome.
 *
 * All icons in the registry (i.e. the icons that we use in the application) are first validated
 * to ensure type-safe usage and are subsequently loaded into the FontAwesome global library.
 *
 * The asynchronous configuration method (`configureAsync`) should be favored over the synchronous
 * configuration method (`configure`) when performing the configuration dynamically in an effort to
 * reduce the bundle size sent to the browser on the initial page load.
 */
export const configureAsync = async (): Promise<void> => {
  const { ICON_REGISTRY } = await import("./registry");
  const { library, config } = await import("@fortawesome/fontawesome-svg-core");
  return configure({ registry: ICON_REGISTRY.slice() as NaiveFAIconDefinition[], library, config });
};
