// Type definitions for mobile-navigation-controller
// Project: https://github.com/uidb-dev/mobile-navigation-controller
// Hand-written to match the shipped runtime behaviour of src/index.js.

import * as React from "react";

/**
 * Direction of a page transition, derived by comparing the `levelPage` of the
 * target page with the `levelPage` of the page being left.
 */
export type NavigatorDirection = "In" | "Out" | "SameLevel";

/**
 * Optional per-navigation overrides accepted by `changePage` and `back`.
 */
export interface NavigatorChangePageOptions {
  /** Extra props merged into the destination page element via cloneElement. */
  props?: Record<string, any>;
  /** animate.css animation name used when moving to a deeper level. */
  animationIn?: string;
  /** Animation duration in milliseconds. Defaults to 250. */
  timeAnimationInMS?: number;
  /** animate.css animation name used when moving back to a shallower level. */
  animationOut?: string;
  /** Invoked once the transition has been kicked off. */
  callbackFun?: () => void;
}

/**
 * Props understood by each child page of `<Navigator>`.
 *
 * NOTE: every child additionally *requires* a React `key`. The key is not part
 * of this interface because React strips `key` from props; the Navigator uses
 * it verbatim as the page id, the DOM element `id`, and the history entry.
 */
export interface NavigatorPageProps {
  /**
   * Depth of the page in the stack. Going to a higher level animates "In",
   * a lower or equal level animates "Out"/"SameLevel". Defaults to 0 for the
   * home page and 99999 otherwise.
   */
  levelPage?: number;
  /** Background colour of the page wrapper. Defaults to "#fff". */
  backgroundColor?: string;
  /** Height of the page wrapper. Falls back to the Navigator `height`, then "100%". */
  height?: string | number;
  /** Enables the iOS-style edge swipe-back gesture on this page. */
  backOnSwipeRight?: boolean;
  /** animate.css animation name used when entering this page. */
  transitionIn?: string;
  /** animate.css animation name used when leaving this page. */
  transitionOut?: string;
  /** Animation duration in milliseconds for this page. Defaults to 250. */
  animationTimeInMS?: number;
  /** Props forwarded to the page element. */
  props?: Record<string, any>;
  /** When true the page is dropped from the history stack and never rendered. */
  kill?: boolean;
  /** Keeps the page mounted even when it is not in the history stack. */
  alwaysLive?: boolean;
}

export interface NavigatorProps {
  /** One or more page elements, each with a unique `key`. */
  children: React.ReactNode;
  /** Key of the page to treat as the root of the stack. Defaults to the first child. */
  homePageKey?: string;
  /** Mirrors the current page into `window.location.hash`. Defaults to true off-device. */
  changeRoute?: boolean;
  /** Controlled route. Changing it navigates to the matching page key. */
  routerKey?: string;
  /** Called with any error caught inside the navigator. */
  onError?: (e: any) => void;
  /** Receives the Navigator instance, for calling `changePage` / `back`. */
  onRef?: (instance: Navigator) => void;
  /** Fired after a page change completes, and once on mount with "In". */
  onChangePage?: (pageKey: string, direction: NavigatorDirection) => void;
  /** Fired before a page change starts. (Misspelling is the shipped API.) */
  beforChangePage?: (goToPage: string, direction: NavigatorDirection) => void;
  /** Return false (or a falsy promise) to cancel a back navigation. */
  beforBack?: () => boolean | Promise<boolean>;
  /** Return false to cancel exiting the app from the root page. */
  beforExit?: () => boolean;
  /** Default height for every page wrapper. Defaults to "100%". */
  height?: string | number;
  /** Default animation duration in milliseconds. Defaults to 250. */
  animationTimeInMS?: number;
}

export default class Navigator extends React.Component<NavigatorProps> {
  /** Stack of page keys, oldest first. The last entry is the current page. */
  historyPages: string[];
  /** Key of the page currently displayed. */
  nowPage: string;
  /** True while a transition animation is in flight; navigation is ignored. */
  busy: boolean;

  /** Navigate to the page with the given key. */
  changePage(goToPage: string, options?: NavigatorChangePageOptions): void;

  /** Navigate to the previous page in `historyPages`. */
  back(options?: NavigatorChangePageOptions): Promise<void>;
}
