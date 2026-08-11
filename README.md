# mobile-navigation-controller

**Level-based back navigation for React mobile & WebView apps.** Every page declares
how deep it sits in your app. "Back" walks *up the tree*, not backwards through clicks.

[![npm](https://img.shields.io/npm/v/mobile-navigation-controller)](https://www.npmjs.com/package/mobile-navigation-controller)
[![downloads](https://img.shields.io/npm/dm/mobile-navigation-controller)](https://www.npmjs.com/package/mobile-navigation-controller)
[![types](https://img.shields.io/npm/types/mobile-navigation-controller)](./src/index.d.ts)
[![license](https://img.shields.io/npm/l/mobile-navigation-controller)](./LICENSE)

> **History is a stack of where you've been. Your app is a tree of where things are.**

In a browser, "back" means linear history — *where I've been*. In a native app, "back"
means hierarchy — *where I am*. `react-router` gives you the first. Mobile apps need
the second. This library gives you the second, and wires it to the Android hardware
back button and the iOS edge-swipe gesture.

> **Which package?** This one and [`navigation-controller`](https://www.npmjs.com/package/navigation-controller)
> are the same lineage, kept separate for historical reasons. Both are maintained.
> **Starting a new project? Use `navigation-controller` — it is the newer line.**
> Full comparison and migration notes: [Which package should I use?](#which-package-should-i-use)

---

## The one example that explains everything

```
Home  →  Content Hub  →  Item A  →  (tap a "related" link, sideways)  →  Item B
```

Now press back from **Item B**.

|                                | Where you land  | Right? |
| ------------------------------ | --------------- | ------ |
| Linear history                 | **Item A**      | ✗      |
| `mobile-navigation-controller` | **Content Hub** | ✓      |

Item A is not "one step back" — it's a *sibling*. Native apps return you to the parent,
because the user's mental model is a tree, not a tape recorder. You get that by giving
Item A and Item B the same `levelPage`:

```jsx
<Navigator onRef={(nav) => (navRef.current = nav)}>
  <Home key="home" levelPage={0} nav={navRef} />
  <Hub  key="hub"  levelPage={1} nav={navRef} />

  {/* Siblings: same level. Back from either one returns to "hub", never to
      the other. Going sideways replaces, it does not stack. */}
  <Item key="item-a" levelPage={2} nav={navRef} />
  <Item key="item-b" levelPage={2} nav={navRef} />
</Navigator>
```

Resulting stack as you navigate:

```
changePage("hub")     →  ["home", "hub"]
changePage("item-a")  →  ["home", "hub", "item-a"]
changePage("item-b")  →  ["home", "hub", "item-b"]   ← item-a pruned
back()                →  ["home", "hub"]              ← lands on the hub
```

## Install

```bash
npm install mobile-navigation-controller
```

Peer dependencies: `react` / `react-dom` — React 18 or 19.

## Minimal working example

```jsx
import { useRef, useState } from "react";
import Navigator from "mobile-navigation-controller";

export default function App() {
  const navRef = useRef(null);          // the Navigator instance
  const [nowPage, setNowPage] = useState("home");

  return (
    <Navigator
      onRef={(nav) => (navRef.current = nav)}
      onChangePage={(pageKey) => setNowPage(pageKey)}
      changeRoute={false}
    >
      {/* levelPage is the whole idea: 0 is the root, higher is deeper. */}
      <Home    key="home"    levelPage={0} nav={navRef} />
      <Details key="details" levelPage={1} nav={navRef} backOnSwipeRight />
    </Navigator>
  );
}

const Home = ({ nav }) => (
  <button onClick={() => nav.current.changePage("details")}>Open details</button>
);

// back() pops one LEVEL, not one click.
const Details = ({ nav }) => <button onClick={() => nav.current.back()}>Back</button>;
```

That is the entire setup. No route table, no history object, no provider.

---

## Why

*Why should "back" depend on the order a user happened to visit pages?* A user who
reached a product from search and a user who reached it from a category should both
go back to something sensible — and "sensible" is a property of your information
architecture, not of their click trail.

*Why should a deep link from a push notification leave the user one tap from exiting
the app?* Open `item-b` cold and the stack is still `["home", "hub", "item-b"]`,
because the stack is derived from levels, not from what actually happened.

*Why should a native-feeling app inherit navigation semantics designed for documents?*
Browser history was built for documents you read in sequence. An app is a place you
move around in.

Call it **the level stack**: every page names its depth, and the stack is always a
path from the root to where you are — never a log of what you clicked.

## When to use this

- A React app inside a **WebView**: Cordova, Capacitor, Ionic, or a mobile web app that
  should feel native.
- You want the **Android hardware back button** to do the right thing without
  hand-maintaining a stack.
- You want **iOS-style edge swipe-back**, per page, with one prop.
- Your app is a **hierarchy** — tabs, hubs, detail pages, wizards — and "back" should
  mean "up".

## When *not* to use this

| Use instead | When |
| --- | --- |
| **`react-router`** | A standard desktop/web SPA where URLs are the primary interface and linear browser history is correct. That is the right tool for documents-and-links; this one is for app hierarchies. You can also run both — see [With React Router](#with-react-router). |
| **`framer-motion`** / `react-transition-group` | You only want animated transitions. Those libraries animate; they do not model navigation semantics or touch the hardware back button. |
| **`@react-navigation/native`** | You are on **React Native**. This library is DOM-based (it renders `<div>`s and uses CSS animations) and will not run there. |
| Plain conditional rendering | You have two or three screens and no back-button requirements. |

---

## The core idea: `levelPage`

Each child page declares a `levelPage` number. That is the only structural
information the library needs.

- Navigating to a **higher** level = going deeper. The page is pushed. Animates `"In"`.
- Navigating to a **lower or equal** level = going up or sideways. Everything at or
  below that depth is pruned from the stack. Animates `"Out"` / `"SameLevel"`.

The whole behaviour is these seven lines, from `src/index.js` (`changePage`), with
the author's original comment:

```js
if (this.listLevelPages[goToPage] <= this.listLevelPages[fromPage]) {
  //חוזרים אחורה, מחק את כל הדפים שהרמה שלהם גבוהה משלי.
  new_historyPages = new_historyPages.filter(
    (x) => this.listLevelPages[x] < this.listLevelPages[goToPage]
  );
}
new_historyPages.push(goToPage);
```

*"Going back — delete every page whose level is higher than mine."*

The stack is therefore always a root-to-current path through your page tree. It cannot
contain two pages at the same level, and it cannot contain a page deeper than the one
you are on.

> **Always set `levelPage` explicitly.** If you omit it, the home page defaults to `0`
> and every other page defaults to `99999` — which makes them all siblings of each
> other and produces confusing pruning.

### Recipe: a tab bar

Tabs are roots. Two correct shapes, depending on what back should do:

```jsx
{/* (a) Every tab is its own root. Back from ANY tab exits the app. */}
<Feed    key="feed"    levelPage={0} />
<Search  key="search"  levelPage={0} />
<Profile key="profile" levelPage={0} />
```

Switching tabs here collapses the stack to just the new tab (`["search"]`), because
nothing can sit below level 0. Back then hits the root and exits — see
[`beforExit`](#navigator-props).

```jsx
{/* (b) Usually nicer: home is the root, other tabs sit one level in.
       Back from any tab returns to the home tab, then exits. */}
<Feed    key="feed"    levelPage={0} />
<Search  key="search"  levelPage={1} />
<Profile key="profile" levelPage={1} />
```

`feed → search → profile` gives `["feed", "profile"]`. `search` is pruned because you
moved sideways, so back goes to `feed` — not through every tab you tried.

---

## Pages stay mounted (and when they don't)

Every page gets a wrapper `<div id={key}>` up front, but its **contents** are mounted
only while the page is on the current path:

| Page | Mounted? |
| --- | --- |
| Current page | yes |
| Ancestors still in the stack | **yes** — scroll position, form state, video playback and timers all survive |
| A sibling that was pruned | no — unmounted, state lost |
| Never-visited pages | no |
| Any page with `alwaysLive` | always |

So drilling `hub → item → back` returns you to a `hub` that never re-rendered from
scratch. But moving `item-a → item-b` genuinely discards `item-a`. Add `alwaysLive`
to a page you need kept alive regardless (an audio player, a long form).

Hidden pages are `display: none`, so they cost no layout — but they are still in the
DOM. Do not put hundreds of heavy pages in one Navigator.

---

## Animations

Transitions use [animate.css](https://animate.css/) animation names.
**animate.css 3.7.0 is bundled** — you do not need to install it.

```jsx
<Details
  key="details"
  levelPage={1}
  transitionIn="slideInRight"
  transitionOut="slideOutRight"
  animationTimeInMS={250}
/>
```

> **Both `"fadeIn"` and `"animate__fadeIn"` work.** animate.css v4 documents its
> animations as `animate__`-prefixed *class* names, but the underlying `@keyframes`
> are unprefixed. This package strips the prefix for you, so either form is safe.
>
> In **1.4.6 and earlier this was not true**: a prefixed name matched no keyframes, no
> animation ran, the completion event never fired, and navigation locked up permanently.
> If you are on an older version, pass the bare name — or upgrade.

### Default animations depend on the level

Unlike `navigation-controller`, this package varies the default by depth:

| Move | Default animation |
| --- | --- |
| Level 0 → 1 | `slideInRight` |
| Any deeper level (1 → 2, 2 → 3, …) | `zoomIn` |
| Level 1 → 0 | `slideOutRight` |
| Any shallower level | `zoomOut` |

Duration defaults to 250 ms. Precedence: page `animationTimeInMS` → Navigator
`animationTimeInMS` → 250.

### Direction-aware RTL

Flip the animation with the text direction so "forward" always moves inward:

```jsx
const dir = i18n.dir(); // "ltr" | "rtl"

<Page
  key="details"
  levelPage={1}
  transitionIn={dir === "ltr" ? "slideInRight" : "slideInLeft"}
  transitionOut={dir === "ltr" ? "slideOutRight" : "slideOutLeft"}
/>
```

### Swipe back

```jsx
<Details key="details" levelPage={1} backOnSwipeRight />
```

The gesture starts only if the touch begins in the **left 20%** of the screen, and
commits if the user drags past **25%** of the screen width — otherwise the page snaps
back. The outgoing animation is forced to `slideOutRight` to match the finger.

---

## Android hardware back button

The Navigator listens for Cordova's `backbutton` event and calls `back()`. When the
stack is down to a single page, back **exits the app** — veto it with `beforExit`:

```jsx
<Navigator
  beforExit={() => window.confirm("Exit the app?")} // return false to stay
  beforBack={() => {
    if (formIsDirty) return false;  // must return TRUTHY to allow back
    return true;
  }}
>
```

Note that in this package `beforBack` receives **no argument**. (In
`navigation-controller` it receives the page you are about to return to.)

---

## With React Router

React Router owns the **URL**; the Navigator owns the **view stack**. Turn off the
Navigator's own hash routing so the two never fight, and feed it the current param:

```jsx
const { key } = useParams();

<Navigator
  changeRoute={false}     // React Router owns the URL — required, or they fight
  routerKey={key}         // NOTE: routerKey here, routeKey in navigation-controller
  homePageKey="home"
>
  {routes.map((r) => (
    <r.component key={r.key} levelPage={r.levelPage} />
  ))}
</Navigator>
```

---

## API

### `<Navigator>` props

| Prop | Type | Notes |
| --- | --- | --- |
| `children` | element(s) | **Required.** Each needs a unique `key`. |
| `homePageKey` | `string` | Root of the stack. Defaults to the first non-`kill` child. |
| `changeRoute` | `boolean` | Mirror the current page into `window.location.hash`. Defaults to `true`, and to `false` when Cordova reports a non-browser platform. |
| `routerKey` | `string` | Controlled route. Changing it navigates. *(Named `routeKey` in `navigation-controller` — see [migration](#which-package-should-i-use).)* |
| `height` | `string \| number` | Default height for every page wrapper. Default `"100%"`. |
| `animationTimeInMS` | `number` | Default transition duration. Default `250`. |
| `onRef` | `(instance) => void` | Hands you the instance for `changePage` / `back`. |
| `onChangePage` | `(pageKey, direction) => void` | Fires **after** a transition, and once on mount with `"In"`. |
| `beforChangePage` | `(goToPage, direction) => void` | Fires before a transition. **Notification only — the return value is ignored.** |
| `beforBack` | `() => boolean \| Promise<boolean>` | Awaited. **Must return truthy or back is cancelled.** Takes no argument. |
| `beforExit` | `() => boolean` | Return falsy to prevent exiting the app from the root. |
| `onError` | `(e) => void` | Internal errors. |

`direction` is `"In"` (deeper), `"Out"` (shallower) or `"SameLevel"` (sibling).

> This package has **no `mobileMode` prop** (mobile mode is auto-detected from
> `window.cordova` only) and **no `errorPageKey`**. Both exist in `navigation-controller`.

### Child page props

| Prop | Type | Notes |
| --- | --- | --- |
| `key` | `string` | **Required**, and becomes the page's DOM `id`. See the gotcha below. |
| `levelPage` | `number` | Depth. Always set it. |
| `backOnSwipeRight` | `boolean` | iOS-style edge swipe-back on this page. |
| `transitionIn` / `transitionOut` | `string` | animate.css names. The `animate__` prefix is optional — it is stripped for you. |
| `animationTimeInMS` | `number` | Overrides the Navigator default. |
| `backgroundColor` | `string` | Wrapper background. Default `"#fff"`. |
| `height` | `string \| number` | Overrides the Navigator default. |
| `className` | `string` | Appended to the generated wrapper classes. |
| `alwaysLive` | `boolean` | Keep mounted even when off the current path. |
| `kill` | `boolean` | Drop the page entirely: never rendered, removed from history. |

### Instance methods (via `onRef`)

```js
nav.changePage("details");
nav.changePage("details", {
  props: { id: 42 },        // injected into the target page via cloneElement
  animationIn: "fadeIn",
  animationOut: "fadeOut",
  timeAnimationInMS: 400,
  callbackFun: () => {},    // called once the transition is kicked off
});

await nav.back();           // async
await nav.back({ animationOut: "zoomOut" });
```

Readable fields: `nav.historyPages` (array of keys, root first), `nav.nowPage`,
`nav.busy` (true while a transition is in flight).

---

## Gotchas

These are real, shipped behaviours. Reading this section will save you an afternoon.

1. **`key` becomes a DOM `id`.** The library looks pages up with
   `document.getElementById(key)`. Keys must be valid HTML ids: no dots, no colons,
   no spaces, no leading digits. `"item-a"` and `"item_a"` are fine; `"item.a"`,
   `"2col"` and `"user:1"` are not.

2. **`beforChangePage`, `beforBack`, `beforExit` are spelled without the "e".**
   That is not a typo in this document — it is the shipped API, kept for backwards
   compatibility. Using the correctly-spelled name silently does nothing.

3. **`beforBack` must return `true`.** A handler that returns `undefined` cancels
   every back navigation, including the hardware back button.

4. **Upgrade if you are below 1.5.0 and use animate.css v4 names.** An
   `animate__`-prefixed name silently deadlocked navigation in earlier versions. See
   [Animations](#animations).

5. **Navigation is ignored while `busy`.** One transition at a time; calls during an
   animation are dropped, not queued.

6. **Transitions complete on an animation-end event.** Since 1.5.0 both the prefixed
   `webkitAnimationEnd` and the standard `animationend` are handled, so desktop Firefox
   works too. In **1.4.6 and earlier only the prefixed event was used**, so navigation
   stalled after the first transition when previewing in Firefox — shipping WebViews
   (iOS WKWebView, Android System WebView) were unaffected.

---

## TypeScript

Types ship with the package — no `@types/` install, nothing to configure.

```ts
import Navigator, {
  NavigatorProps,
  NavigatorPageProps,
  NavigatorDirection,          // "In" | "Out" | "SameLevel"
  NavigatorChangePageOptions,
} from "mobile-navigation-controller";
```

`key` is deliberately absent from `NavigatorPageProps`, because React strips `key`
from props.

---

## Which package should I use?

There are two packages in this family, for historical reasons. They are the same
lineage, and both are maintained.

| | `mobile-navigation-controller` *(this one)* | [`navigation-controller`](https://www.npmjs.com/package/navigation-controller) |
| --- | --- | --- |
| Version | 1.5.x | 4.x |
| Controlled route prop | **`routerKey`** | **`routeKey`** |
| `errorPageKey` | no | yes |
| `mobileMode` prop | auto-detect only | yes |
| `beforBack` argument | *(none)* | `(backToPage)` |
| Default deep animation | `zoomIn` / `zoomOut` below level 1 | `slideInRight` / `slideOutRight` everywhere |
| `"animate__"` prefix stripped | yes (since 1.5.0) | yes |
| History update on transition | synchronous | promise-sequenced |
| Bundled animate.css | 3.7.0 | 4.1.1 |

**New project?** Use **`navigation-controller`** — it is the newer line.

**Migrating to `navigation-controller`?** Three things to change:

1. `routerKey` → **`routeKey`**. This fails silently: the prop is simply ignored, and
   your app stops responding to route changes with no error.
2. `beforBack` now receives the target page key as its first argument.
3. Default animations below level 1 change from zoom to slide. If you relied on the
   zoom defaults, set `transitionIn` / `transitionOut` explicitly.

No deprecation is announced for either package.

---

## Contributing & support

Issues and pull requests: <https://github.com/uidb-dev/mobile-navigation-controller/issues>

## License

ISC © [ui-db.com](https://ui-db.com)
