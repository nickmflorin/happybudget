import React, { lazy } from "react";

type LazyReturnType = { default: React.ComponentType<Record<string, unknown>> };

/**
 * Sometimes, when lazy loading components, a user's browser will automatically
 * cache files that reference the old bundled files, leading to errors when the
 * browser tries to lazy load these files that are referenced by their previous
 * bundle names (not the most recent ones).
 *
 * This function will perform the lazy component load but refresh the browser
 * if there is an error loading the component, so that the browser resets its
 * cache and tries to lazy load the component by its newer bundle name.
 *
 * Reference: https://raphael-leger.medium.com/
 *   react-webpack-chunkloaderror-loading-chunk-x-failed-ac385bd110e0
 */
const lazyWithRetry = (lazyComponent: () => Promise<LazyReturnType>) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.localStorage.getItem("page-has-been-force-refreshed") || "false"
    );
    try {
      const component = await lazyComponent();
      window.localStorage.setItem("page-has-been-force-refreshed", "false");
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        /* Assuming that the user is not on the latest version of the application,
           let's refresh the page immediately. */
        window.localStorage.setItem("page-has-been-force-refreshed", "true");
        window.location.reload();
        /* This is solely to get TS to not complain about the return type on this
           function.  Without it, components loaded with this method will be
           evaluated as potentially undefined and would not allow us to use them
           in the DOM tree.  It is purely a typing fix, as this line will never
           get reached because of the window.location.reload() */
        return { default: lazy(() => import("./DefaultComponent")) as React.ComponentType<Record<string, unknown>> };
      }
      /* The page has already been reloaded.  Assuming that the user is using
         the latest version of the application, let the application crash and
         raise the error. */
      throw error;
    }
  });

export default lazyWithRetry;
