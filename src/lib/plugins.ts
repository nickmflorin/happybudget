import moment from "moment-timezone";
import Cookies from "universal-cookie";
import { isNil, find } from "lodash";

const cookies = new Cookies();

type KeyType = "time" | "user";
type PluginId = "segment" | "canny" | "intercom";

/* eslint-disable-next-line no-unused-vars */
type PluginKeys<K extends string> = { [key in KeyType]: K };

type Plugin<ID extends PluginId, K extends string> = { id: ID; keys: PluginKeys<K>; delayTime: number };

const Plugins: Plugin<PluginId, string>[] = [
  {
    id: "segment",
    delayTime: 15,
    keys: {
      time: "lastIdentifiedSegmentTime",
      user: "lastIdentifiedSegmentUser"
    }
  },
  {
    id: "canny",
    delayTime: 6,
    keys: {
      time: "lastIdentifiedCannyTime",
      user: "lastIdentifiedCannyUser"
    }
  },
  {
    id: "intercom",
    delayTime: 0,
    keys: {
      time: "lastIdentifiedIntercomTime",
      user: "lastIdentifiedIntercomUser"
    }
  }
];

const getPlugin = <ID extends PluginId, K extends string>(id: ID): Plugin<ID, K> =>
  find(Plugins, { id } as any) as Plugin<ID, K>;

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

const parseDurationSinceLastIdentify = (id: PluginId, user: Model.User): number | null => {
  const plugin = getPlugin(id);
  const lastIdentifiedTime = cookies.get(plugin.keys.time);
  const now = moment();
  try {
    new Date(lastIdentifiedTime).toISOString();
  } catch (e: unknown) {
    if (e instanceof RangeError) {
      return null;
    }
    throw e;
  }
  const mmt = moment.tz(lastIdentifiedTime, user.timezone);
  if (mmt.isValid()) {
    const duration = moment.duration(now.diff(mmt));
    return duration.minutes();
  }
  return null;
};

const identifyRequired = (id: PluginId, user: Model.User): boolean => {
  const userId = parseLastIdentifiedUser(id);
  const delta = parseDurationSinceLastIdentify(id, user);
  return isNil(userId) || isNil(delta) || (!isNil(delta) && delta > 6) || (!isNil(userId) && userId !== user.id);
};

const postIdentify = (id: PluginId, user: Model.User) => {
  const plugin = getPlugin(id);
  cookies.set(plugin.keys.user, user.id, { path: "/" });
  cookies.set(plugin.keys.time, moment().toISOString(), { path: "/" });
};

export const identifySegment = (user: Model.User) => {
  if (identifyRequired("segment", user) && process.env.NODE_ENV !== "development") {
    window.analytics.identify(user.id, {
      name: user.full_name,
      email: user.email
    });
    postIdentify("segment", user);
  }
};

/**
 * Uses the Canny SDK to associate the currently logged in user.
 *
 * Canny's API has certain rate limits, and we want to avoid hitting those.
 * The most relevant one is that we cannot send a request to identify a user
 * more than 1 time in 5 minutes, so we make sure that we haven't identified
 * the same user more than 1 time in 6 minutes to be safe.
 *
 * @param user  The currently logged in user.
 */
export const identifyCanny = (user: Model.User) => {
  if (identifyRequired("canny", user)) {
    /* We do not want to makes calls to Canny's API in local development by
       default. */
    if (!isNil(process.env.REACT_APP_CANNY_APP_ID)) {
      window.Canny("identify", {
        appID: process.env.REACT_APP_CANNY_APP_ID,
        user: {
          id: user.id,
          email: user.email,
          name: user.full_name,
          avatarURL: user.profile_image?.url,
          created: new Date(user.date_joined).toISOString()
        }
      });
      postIdentify("canny", user);
    } else if (process.env.NODE_ENV === "production") {
      console.warn(
        `Could not identify Canny user as ENV variable 'REACT_APP_CANNY_APP_ID'
				is not defined.`
      );
    }
  }
};

export const identifyIntercom = (user: Model.User) => {
  if (identifyRequired("intercom", user)) {
    if (!isNil(process.env.REACT_APP_INTERCOM_APP_ID)) {
      window.Intercom("boot", {
        app_id: process.env.REACT_APP_INTERCOM_APP_ID,
        user_id: user.id,
        email: user.email,
        name: user.full_name,
        created_at: new Date(user.date_joined).toISOString(),
        custom_launcher_selector: "#support-menu-item-intercom-chat"
      });
    } else if (process.env.NODE_ENV === "production") {
      console.warn(
        `Could not identify Intercom user as ENV variable 'REACT_APP_INTERCOM_APP_ID'
				is not defined.`
      );
    }
  }
};

export const identify = (user: Model.User) => {
  identifyCanny(user);
  identifySegment(user);
  identifyIntercom(user);
};
