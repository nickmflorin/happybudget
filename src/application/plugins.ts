import { find } from "lodash";
import { Moment } from "moment";
import moment from "moment-timezone";
import Cookies from "universal-cookie";

import { logger } from "internal";
import { model, formatters, parsers } from "lib";

const cookies = new Cookies();

type KeyType = "time" | "user";
type PluginId = "segment" | "canny" | "intercom";

type PluginKeys<K extends string> = { [key in KeyType]: K };

type Plugin<ID extends PluginId, K extends string> = {
  id: ID;
  keys: PluginKeys<K>;
  delayTime: number;
};

const Plugins: Plugin<PluginId, string>[] = [
  {
    id: "segment",
    delayTime: 15,
    keys: {
      time: "lastIdentifiedSegmentTime",
      user: "lastIdentifiedSegmentUser",
    },
  },
  {
    id: "canny",
    delayTime: 6,
    keys: {
      time: "lastIdentifiedCannyTime",
      user: "lastIdentifiedCannyUser",
    },
  },
  {
    id: "intercom",
    delayTime: 0,
    keys: {
      time: "lastIdentifiedIntercomTime",
      user: "lastIdentifiedIntercomUser",
    },
  },
];

const getPlugin = <ID extends PluginId, K extends string>(id: ID): Plugin<ID, K> =>
  find(Plugins, { id }) as Plugin<ID, K>;

const parseLastIdentifiedUser = (id: PluginId): number | null => {
  const plugin = getPlugin(id);
  const lastIdentifiedUser = cookies.get(plugin.keys.user);
  if (typeof lastIdentifiedUser === "string") {
    const userId = parseInt(lastIdentifiedUser);
    if (!isNaN(userId)) {
      return userId;
    }
  }
  return null;
};

const parseDurationSinceLastIdentify = (id: PluginId, user: model.User): number | null => {
  const plugin = getPlugin(id);
  const lastIdentifiedTime = cookies.get(plugin.keys.time);
  const now = moment();

  // Do not log a warning if the date is invalid because it is stored in cookies, it can be anything
  const lastIdentifiedMmt = formatters.localizedMomentFormatter(user.timezone)({
    value: lastIdentifiedTime,
    strict: false,
    logError: false,
  });
  if (lastIdentifiedMmt !== null) {
    return moment.duration(now.diff(lastIdentifiedMmt)).minutes();
  }
  return null;
};

type IdentifyPluginOptions = {
  readonly pluginId: PluginId;
  readonly flag: string | undefined;
  readonly flagName: string;
};

type IdentifyPluginOptionsWithAppId = IdentifyPluginOptions & {
  readonly appId: string | undefined;
  readonly appIdName: string;
};

type IdentifyOptions = IdentifyPluginOptionsWithAppId | IdentifyPluginOptions;

type IdentifyPluginCallbackParams<O extends IdentifyOptions> =
  O extends IdentifyPluginOptionsWithAppId
    ? { appId: string; dateJoined: Moment }
    : { dateJoined: string };

const isIdentifyOptionsWithAppId = (
  options: IdentifyOptions,
): options is IdentifyPluginOptionsWithAppId =>
  (options as IdentifyPluginOptionsWithAppId).appId !== undefined;

let DO_NOT_RETRY_IDENTIFICATIONS: { [key in PluginId]: boolean } = {
  segment: false,
  canny: false,
  intercom: false,
};

const identifyRequired = (id: PluginId, user: model.User): boolean => {
  if (DO_NOT_RETRY_IDENTIFICATIONS[id] === false) {
    const userId = parseLastIdentifiedUser(id);
    const delta = parseDurationSinceLastIdentify(id, user);
    return (
      userId === null ||
      delta === null ||
      (delta !== null && delta > 6) ||
      (userId !== null && userId !== user.id)
    );
  }
  return false;
};

const postIdentify = (id: PluginId, user: model.User) => {
  const plugin = getPlugin(id);
  cookies.set(plugin.keys.user, user.id);
  cookies.set(plugin.keys.time, moment().toISOString());
};

const doNotRetryIdentification = (id: PluginId, user: model.User) => {
  DO_NOT_RETRY_IDENTIFICATIONS = { ...DO_NOT_RETRY_IDENTIFICATIONS, [id]: true };
  postIdentify(id, user);
};

const identifyPlugin = <O extends IdentifyOptions>(
  user: model.User,
  options: O,
  identify: (p: IdentifyPluginCallbackParams<O>) => void,
) => {
  if (options.flag !== undefined && identifyRequired(options.pluginId, user)) {
    const BOOLEAN_FLAG = parsers.parseBoolean(options.flag, { logInvalid: false });
    if (BOOLEAN_FLAG === null) {
      logger.warn(
        { pluginId: options.pluginId, flag: options.flagName },
        `Error Performing Identification Process for ${options.pluginId}: ` +
          `The environment variable '${options.flagName}' is not a valid boolean indicator.`,
      );
      return doNotRetryIdentification(options.pluginId, user);
    } else if (BOOLEAN_FLAG === true) {
      const userJoined = formatters.localizedMomentFormatter(user.timezone)({
        value: user.date_joined,
        strict: false,
        logError: false,
      });
      if (userJoined === null) {
        logger.warn(
          { userId: user.id, dateJoined: user.date_joined, pluginId: options.pluginId },
          `Error Performing Identification Process for ${options.pluginId}: ` +
            `The user ${user.id} has an invalid value for the 'date_joined' attribute ` +
            `(value = '${user.date_joined}'), which cannot be parsed as a date.`,
        );
        /* Update the last time the identification process was attempted such that subsequent
           re-attempts are not constantly made. */
        return postIdentify(options.pluginId, user);
      } else if (isIdentifyOptionsWithAppId(options)) {
        if (options.appId === undefined || options.appId.toLowerCase() === "none") {
          logger.error(
            { pluginId: options.pluginId, name: options.appIdName },
            `Error Performing Identification Process for ${options.pluginId}: ` +
              `The environment variable '${options.appIdName}' is required for the plugin ` +
              `${options.pluginId}.`,
          );
          return doNotRetryIdentification(options.pluginId, user);
        }
        identify({
          appId: options.appId,
          dateJoined: userJoined,
        } as IdentifyPluginCallbackParams<O>);
        return postIdentify(options.pluginId, user);
      }
      identify({
        dateJoined: userJoined,
      } as IdentifyPluginCallbackParams<O>);
      return postIdentify(options.pluginId, user);
    }
  } else {
    /* TODO: When we incorporate Sentry with Roarr logging, this should be a log that is not
       dispatched to Sentry. */
    logger.info(
      { pluginId: options.pluginId, userId: user.id },
      `Skipping plugin identification for plugin ${options.pluginId}, ${options.flagName} ` +
        "was not found in environment.",
    );
    return doNotRetryIdentification(options.pluginId, user);
  }
};

export const identifySegment = (user: model.User) => {
  identifyPlugin(
    user,
    {
      flag: process.env.NEXT_PUBLIC_SEGMENT_ENABLED,
      flagName: "NEXT_PUBLIC_SEGMENT_ENABLED",
      pluginId: "segment",
    },
    () => {
      if (window.analytics === undefined) {
        logger.error("Segment 'analytics' is not properly attached to the global window object.");
        return;
      }
      window.analytics.identify(user.id, {
        name: user.full_name,
        email: user.email,
      });
    },
  );
};

/**
 * Uses the Canny SDK to associate the currently logged in user.
 *
 * Canny's API has certain rate limits, and we want to avoid hitting those.  The most relevant one
 * is that we cannot send a request to identify a user more than 1 time in 5 minutes, so we make
 * sure that we haven't identified the same user more than 1 time in 6 minutes to be safe.
 *
 * @param {model.User} user  The currently logged in user.
 */
export const identifyCanny = (user: model.User) => {
  identifyPlugin(
    user,
    {
      flag: process.env.NEXT_PUBLIC_CANNY_ENABLED,
      flagName: "NEXT_PUBLIC_CANNY_ENABLED",
      appId: process.env.NEXT_PUBLIC_CANNY_APP_ID,
      appIdName: "NEXT_PUBLIC_CANNY_APP_ID",
      pluginId: "canny",
    },
    (params: { appId: string; dateJoined: Moment }) => {
      if (window.Canny === undefined) {
        logger.error("Canny is not properly attached to the global window object.");
        return;
      }
      window.Canny("identify", {
        appID: params.appId,
        user: {
          id: user.id,
          email: user.email,
          name: user.full_name,
          avatarURL: user.profile_image?.url,
          created: params.dateJoined.toISOString(),
        },
      });
    },
  );
};

export const identifyIntercom = (user: model.User) => {
  identifyPlugin(
    user,
    {
      flag: process.env.NEXT_PUBLIC_INTERCOM_ENABLED,
      flagName: "NEXT_PUBLIC_INTERCOM_ENABLED",
      appId: process.env.NEXT_PUBLIC_INTERCOM_APP_ID,
      appIdName: "NEXT_PUBLIC_INTERCOM_APP_ID",
      pluginId: "intercom",
    },
    (params: { appId: string; dateJoined: Moment }) => {
      if (window.Intercom === undefined) {
        logger.error("Intercom is not properly attached to the global window object.");
        return;
      }
      window.Intercom("boot", {
        app_id: params.appId,
        user_id: user.id,
        email: user.email,
        name: user.full_name,
        created_at: params.dateJoined.toISOString(),
        custom_launcher_selector: "#support-menu-item-intercom-chat",
      });
    },
  );
};

export const identify = (user: model.User) => {
  if (typeof window !== "undefined") {
    identifyCanny(user);
    identifySegment(user);
    identifyIntercom(user);
  }
};
