import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { describe, it, expect, vi } from 'vitest';
import Navigator from 'mobile-navigation-controller';

const Page = ({ children }) => <div className="page">{children}</div>;

function mount(element) {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const root = createRoot(div);
    act(() => { root.render(element); });
    return {
        div,
        unmount: () => { act(() => { root.unmount(); }); div.remove(); }
    };
}

describe('Navigator', () => {
    it('fires the initial onChangePage on mount (regression: duplicate componentDidMount)', () => {
        const onChangePage = vi.fn();
        const { unmount } = mount(
            <Navigator changeRoute={false} onChangePage={onChangePage}>
                <Page key="home" levelPage={0}>home</Page>
                <Page key="details" levelPage={1}>details</Page>
            </Navigator>
        );

        expect(onChangePage).toHaveBeenCalledWith('home', 'In');
        unmount();
    });

    it('renders a single child declaring transitionIn without throwing (regression: ReferenceError on `children`)', () => {
        const onChangePage = vi.fn();
        const onError = vi.fn();
        const { div, unmount } = mount(
            <Navigator changeRoute={false} onChangePage={onChangePage} onError={onError}>
                <Page key="only" levelPage={0} transitionIn="fadeIn" transitionOut="fadeOut">
                    only
                </Page>
            </Navigator>
        );

        expect(onError).not.toHaveBeenCalled();
        expect(div.querySelector('#only')).toBeTruthy();
        expect(onChangePage).toHaveBeenCalledWith('only', 'In');
        unmount();
    });

    it('uses child keys verbatim as DOM ids (guards against React.Children.toArray key rewriting)', () => {
        const { div, unmount } = mount(
            <Navigator changeRoute={false}>
                <Page key="home" levelPage={0}>home</Page>
                <Page key="details" levelPage={1}>details</Page>
            </Navigator>
        );

        expect(div.querySelector('#home')).toBeTruthy();
        expect(div.querySelector('#details')).toBeTruthy();
        unmount();
    });

    it('exposes historyPages / nowPage / changePage through onRef', () => {
        let nav = null;
        const { unmount } = mount(
            <Navigator changeRoute={false} onRef={(ref) => { nav = ref; }}>
                <Page key="home" levelPage={0}>home</Page>
                <Page key="details" levelPage={1}>details</Page>
            </Navigator>
        );

        expect(nav).toBeTruthy();
        expect(nav.historyPages).toEqual(['home']);
        expect(nav.nowPage).toBe('home');
        expect(typeof nav.changePage).toBe('function');
        expect(typeof nav.back).toBe('function');
        unmount();
    });

    it('does not blow up on array operations when there is exactly one child (regression: unguarded .filter/.forEach)', () => {
        const onError = vi.fn();
        // Returning false from beforExit stops back() at the root of the stack
        // before it reaches the Cordova-only window.navigator.app.exitApp().
        const beforExit = vi.fn(() => false);
        let nav = null;
        const { unmount } = mount(
            <Navigator
                changeRoute={false}
                onError={onError}
                beforExit={beforExit}
                onRef={(ref) => { nav = ref; }}
            >
                <Page key="only" levelPage={0}>only</Page>
            </Navigator>
        );

        act(() => { nav.changePage('only'); });
        act(() => { nav.back(); });

        // back() walks props.children with .forEach before delegating to
        // changePage, which walks it again with .filter -- both used to throw
        // TypeError for a single (non-array) child.
        expect(beforExit).toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
        unmount();
    });

    it('applies the animation inline style when navigating up a level', () => {
        let nav = null;
        const { div, unmount } = mount(
            <Navigator changeRoute={false} onRef={(ref) => { nav = ref; }}>
                <Page key="home" levelPage={0}>home</Page>
                <Page key="details" levelPage={1}>details</Page>
            </Navigator>
        );

        act(() => { nav.changePage('details', { timeAnimationInMS: 10 }); });

        const details = div.querySelector('#details');
        expect(details.classList.contains('showPage')).toBe(true);
        expect(details.classList.contains('hiddenPage')).toBe(false);
        expect(details.style.animation).toContain('slideInRight');
        expect(details.style.zIndex).toBe('89');
        unmount();
    });
});
