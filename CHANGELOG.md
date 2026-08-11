# Changelog

All notable changes to `mobile-navigation-controller` are documented here.
This project follows [Semantic Versioning](https://semver.org/).

## 1.5.0

First release since 1.4.6.

### Behaviour change

- **`onChangePage` now fires on mount.** The class defined `componentDidMount`
  twice and the second definition silently shadowed the first, so the initial
  `onChangePage(startPage, "In")` callback never ran. It now runs, once, right
  after the back-button and hash-change listeners are attached. If your handler
  was written assuming it is only ever called for *subsequent* navigations, it
  will now also see the start page. A handler that throws is reported through
  `onError` and does not propagate — see below.

### Fixed

- A consumer `onChangePage` handler that throws no longer crashes the React tree
  at startup. The mount-time call sat outside the `try/catch` that guards every
  other `onChangePage` call site, so the exception escaped `componentDidMount`.
  It is now routed to `props.onError` like every other callback failure.
- **The navigator no longer deadlocks on animate.css v4 transition names.**
  animate.css v4 exposes `animate__`-prefixed *class* names while its
  `@keyframes` stay unprefixed, and this library drives transitions through the
  `animation` style property. Passing the documented v4 name (for example
  `transitionIn="animate__slideInRight"`) matched no keyframe, so no animation
  ran, no animation-end event ever fired, the internal `busy` flag latched true
  and the navigator froze permanently — every later `changePage` and `back` was
  silently dropped, with no error. Transition names are now normalised wherever
  they are read: the child `transitionIn`/`transitionOut` props and the
  `animationIn`/`animationOut` fields of the `changePage`/`back` options.
- With exactly one child, a page's `height` prop was silently dropped: the
  single-child render branch assigned the child's whole props *object* to
  `style.height`, which React discards, so the height came out `""`. The
  multi-child branch was already correct.
- Transitions now complete on the unprefixed `animationend` event as well as
  `webkitAnimationEnd`, so navigation no longer stalls after the first
  transition in Firefox (harmless in Cordova/Capacitor WebViews, which are
  Chromium/WebKit). The completion handler runs exactly once — both listeners
  are detached on the first accepted event — so a browser firing both events
  cannot double-advance the history stack, and animation-end events bubbling up
  from content *inside* a page are ignored so page content cannot end a page
  transition early.
- Duplicate `componentDidMount` (see above).
- `ReferenceError` during construction when the single child declared
  `transitionIn`: the constructor read an undefined `children` binding.
- `changePage()` and `back()` called `.filter()`/`.forEach()` straight on
  `props.children`, which is a single element and not an array when there is
  exactly one child.

### Added

- Hand-written TypeScript definitions (`dist/index.d.ts`).
- A `LICENSE` file (ISC), which the package had always declared but never
  shipped.
- A vitest regression suite covering every fix above **and** the level-based
  navigation the package exists for: `home` → `hub` → `itemA` → sibling `itemB`
  (pruning `itemA`) → `back()` landing on the parent, asserting `historyPages`,
  `nowPage` and the `"In"`/`"SameLevel"`/`"Out"` direction at each step.

### Changed

- `react` / `react-dom` peer range widened to `^18.2.0 || ^19.0.0`. React 19 is
  verified working, including a full level-based navigation run.
- The unused `prop-types` peer dependency is dropped. This package has no
  `prop-types` usage at all, so it no longer asks consumers to install it.
- Vendored jQuery 3.3.1 (~87KB, CVE-2019-11358, CVE-2020-11022/11023) removed in
  favour of `classList`/`style` helpers. Call ordering inside every animation
  function, including the swipe-gesture handlers, is unchanged.
- Debug `console.log` calls removed. `console.error` diagnostics are kept.

### Removed from the published package

The tarball is now limited to `dist/`, `README.md` and `LICENSE`. `dist/jquery-3.3.1.min.js`
was published in 1.4.x and is **gone** — if you deep-import it, that import will
break. The supported entry points are unchanged: `mobile-navigation-controller`
(→ `dist/index.js`) and its types (→ `dist/index.d.ts`).

## 1.4.6 and earlier

Not documented. See the git history.
