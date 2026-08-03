"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _jquery = _interopRequireDefault(require("./jquery-3.3.1.min"));
require("./styles.css");
require("./animate.css");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// import { setTimeout } from "timers";

class Navigator extends _react.default.Component {
  constructor(props) {
    super(props);
    var startPage = "";
    var mobileMode = false;
    if (window.cordova) {
      if (window.cordova.platformId !== "browser") mobileMode = true;
    }
    var homePage = this.props.homePageKey ? this.props.homePageKey : Array.isArray(this.props.children) ? this.props.children.filter(child => typeof child === "object" && !child.props.kill)[0].key : this.props.children.key;
    var changeRoute = true; //default
    if (mobileMode) changeRoute = false;
    if (this.props.changeRoute !== undefined) changeRoute = this.props.changeRoute;
    if (!changeRoute) {
      startPage = homePage;
    } else {
      startPage = window.location.href.substr(window.location.href.lastIndexOf("/")) === "/" || window.location.href.substr(window.location.href.lastIndexOf("/")) === "/#" ? homePage : window.location.href.substr(window.location.href.lastIndexOf("/") + 2);
    }
    if (props.routerKey) {
      startPage = props.routerKey;
    }
    this.touchBackPage = "";
    this.callbackFunOnChangePage = () => {};
    var fthis = this;
    this.onError = e => {
      console.error("navigator error");
      console.error(e);
      if (fthis.props.onError) this.props.onError(e);
    };
    var historyPages = [];
    historyPages.push(homePage);
    if (startPage !== homePage) historyPages.push(startPage);
    this.state = {
      changeRoute: changeRoute,
      historyPages: historyPages,
      nowPage: startPage,
      homePageKey: homePage,
      // height: this.props.height ? this.props.height : "100%",
      startPage: startPage,
      mobileMode: mobileMode,
      swipeRight_x: 0,
      swipeRightStart_x: 0,
      props: []
    };
    this.swipeRight = false;
    // this.myComponentApp = this.props.myComponentApp;

    this.historyPages = this.state.historyPages;
    this.listLevelPages = [];
    this.componentTransitionIn = [];
    this.componentTransitionOut = [];
    var listLevelPages = this.listLevelPages;
    if (Array.isArray(this.props.children)) {
      this.props.children.filter(child => typeof child === "object" && !child.props.kill).forEach(child => {
        listLevelPages[child.key] = child.props.levelPage === undefined ? child.key === homePage ? 0 : 99999 : child.props.levelPage;
        if (child.props.transitionIn) this.componentTransitionIn[child.key] = child.props.transitionIn;
        if (child.props.transitionOut) this.componentTransitionOut[child.key] = child.props.transitionOut;
      });
    } else {
      listLevelPages[this.props.children.key] = this.props.children.props.levelPage === undefined ? this.props.children.key === homePage ? 0 : 99 : this.props.children.props.levelPage;
      if (children.props.transitionIn) this.componentTransitionIn[children.key] = children.props.transitionIn;
      if (children.props.transitionOut) this.componentTransitionOut[children.key] = children.props.transitionOut;
    }

    // const childrenWithProps = React.Children.map(this.props.children, child =>
    //   React.cloneElement(child, { doSomething: this.doSomething })
    // );
    // this.props.nowPage(this.historyPages[this.historyPages.length - 1]);

    this.busy = false;
    if (this.props.onRef) this.props.onRef(this);
    this.changePage = this.changePage.bind(this);
    this.back = this.back.bind(this);
    this.funAnimationIn1 = this.funAnimationIn1.bind(this);
    this.funAnimationIn2 = this.funAnimationIn2.bind(this);
    this.funAnimationOut1 = this.funAnimationOut1.bind(this);
    this.funAnimationOut2 = this.funAnimationOut2.bind(this);
    this.compareTwoPagesLavel = this.compareTwoPagesLavel.bind(this);
    if (Array.isArray(this.props.children)) this.props.children.map(child => {
      if (child.key === null || child.key === "") window.console.error("navigation_controller: key value it's required");
    });
  }
  componentDidMount() {
    if (this.props.onChangePage !== undefined) this.props.onChangePage(this.state.historyPages[this.state.historyPages.length - 1], "In");
  }
  componentDidUpdate(prevProps) {
    if (this.props.routerKey !== prevProps.routerKey) {
      this.changePage(this.props.routerKey ? this.props.routerKey : this.state.homePageKey);
    }
  }
  //----navigator and animation----///
  funAnimationIn1(goToPage, fromPage) {
    var fthis = this;
    try {
      if (document.getElementById(goToPage) === null || document.getElementById(goToPage) === undefined) {
        console.error("goToPage not found: ", goToPage);
      }
      if (document.getElementById(fromPage) === null || document.getElementById(fromPage) === undefined) {
        console.error("fromPage not found: ", fromPage);
      }
      if (this.props.beforChangePage !== undefined) this.props.beforChangePage(goToPage, this.compareTwoPagesLavel(goToPage, fromPage));

      //--נכנסים דף פנימה Up--//
      var callbackFun = () => {
        try {
          fthis.funAnimationIn2(goToPage, fromPage);
          document.getElementById(goToPage).removeEventListener("webkitAnimationEnd", callbackFun);
        } catch (error) {
          fthis.onError(error);
        }
      };
      document.getElementById(goToPage).addEventListener("webkitAnimationEnd", callbackFun, false);
      this.busy = true;
      (0, _jquery.default)("#" + goToPage).removeClass("hiddenPage");
      (0, _jquery.default)("#" + goToPage).addClass("scrollPage showPage");
      (0, _jquery.default)("#" + fromPage).css("z-index", 0);
      (0, _jquery.default)("#" + goToPage).css("z-index", 89);
    } catch (error) {
      fthis.onError(error);
    }
  }
  funAnimationIn2(goToPage, fromPage) {
    var fthis = this;
    try {
      if (document.getElementById(goToPage) === null || document.getElementById(goToPage) === undefined) {
        console.error("goToPage not found: ", goToPage);
      }
      if (document.getElementById(fromPage) === null || document.getElementById(fromPage) === undefined) {
        console.error("fromPage not found: ", fromPage);
      }
      (0, _jquery.default)("#" + fromPage).css("z-index", "");
      (0, _jquery.default)("#" + goToPage).css("z-index", "");
      (0, _jquery.default)("#" + goToPage).css("animation", "");
      (0, _jquery.default)("#" + fromPage).removeClass("showPage");
      (0, _jquery.default)("#" + fromPage).removeClass("scrollPage");
      (0, _jquery.default)("#" + fromPage).addClass("hiddenPage");
      this.busy = false;
      this.setState({
        nowPage: goToPage
      });
      if (this.props.onChangePage !== undefined) this.props.onChangePage(fthis.state.historyPages[this.state.historyPages.length - 1], fthis.compareTwoPagesLavel(goToPage, fromPage));
    } catch (error) {
      fthis.onError(error);
    }
  }
  funAnimationOut1(goToPage, fromPage) {
    //--חזרה בדפים Down--//

    var fthis = this;
    try {
      if (document.getElementById(goToPage) === null || document.getElementById(goToPage) === undefined) {
        console.error("goToPage not found: ", goToPage);
      }
      if (document.getElementById(fromPage) === null || document.getElementById(fromPage) === undefined) {
        console.error("fromPage not found: ", fromPage);
        // return;
      }
      if (this.props.beforChangePage !== undefined) fthis.props.beforChangePage(goToPage, fthis.compareTwoPagesLavel(goToPage, fromPage));
      var callbackFun = () => {
        try {
          fthis.funAnimationOut2(goToPage, fromPage);
          document.getElementById(fromPage).removeEventListener("webkitAnimationEnd", callbackFun);
        } catch (error) {
          fthis.onError(error);
        }
      };
      document.getElementById(fromPage).addEventListener("webkitAnimationEnd", callbackFun);
      this.busy = true;
      (0, _jquery.default)("#" + goToPage).css("z-index", 0);
      (0, _jquery.default)("#" + fromPage).css("z-index", 89);
      (0, _jquery.default)("#" + goToPage).removeClass("hiddenPage");
      (0, _jquery.default)("#" + goToPage).addClass("scrollPage showPage");
    } catch (error) {
      fthis.onError(error);
    }
  }
  funAnimationOut2(goToPage, fromPage) {
    if (document.getElementById(goToPage) === null || document.getElementById(goToPage) === undefined) {
      console.error("goToPage not found: ", goToPage);
    }
    if (document.getElementById(fromPage) === null || document.getElementById(fromPage) === undefined) {
      console.error("fromPage not found: ", fromPage);
    }
    var fthis = this;
    try {
      (0, _jquery.default)("#" + fromPage).css("animation", "");
      (0, _jquery.default)("#" + goToPage).css("z-index", "");
      (0, _jquery.default)("#" + goToPage).css("left", "");
      (0, _jquery.default)("#" + fromPage).css("z-index", "");
      (0, _jquery.default)("#" + fromPage).removeClass("showPage");
      (0, _jquery.default)("#" + fromPage).removeClass("scrollPage");
      (0, _jquery.default)("#" + fromPage).addClass("hiddenPage");
      this.busy = false;
      this.setState({
        nowPage: goToPage
      });
      if (this.props.onChangePage !== undefined) this.props.onChangePage(fthis.state.historyPages[this.state.historyPages.length - 1], fthis.compareTwoPagesLavel(goToPage, fromPage));
      this.callbackFunOnChangePage();
    } catch (error) {
      fthis.onError(error);
    }
  }
  compareTwoPagesLavel(goToPage, fromPage) {
    var fthis = this;
    try {
      if (this.listLevelPages[goToPage] < this.listLevelPages[fromPage]) return "Out";
      if (this.listLevelPages[goToPage] > this.listLevelPages[fromPage]) return "In";
      return "SameLevel";
    } catch (error) {
      fthis.onError(error);
    }
  }
  changePage(goToPage, options) {
    var fthis = this;
    try {
      //סיום האפליקציה, סגור
      if (this.state.historyPages.length === 1 && goToPage === undefined) {
        console.log('"window.navigator.app.exitApp()"');
        // fthis.showSwalLater ?
        //     fthis.myChildrens.swal.runSwal(true) :
        if (this.props.beforExit) if (!this.props.beforExit()) return;
        window.navigator.app.exitApp();
        return;
      }
      if (goToPage === undefined) {
        console.error("navigator error: changePage function need goToPage parameter.");
        return;
      }
      if (fthis.listLevelPages[goToPage] === undefined) {
        console.error("navigator error, at changePage. goToPage parameter not found in the pages list.");
        return;
      }
      this.props.children.filter(child => typeof child === "object").forEach(child => {
        if (child.props.kill) {
          fthis.historyPages = fthis.historyPages.filter(x => x !== child.key);
        }
      });
      this.setState({
        historyPages: this.historyPages
      });
      var fromPage = "" + this.historyPages[this.historyPages.length - 1] + "";
      var aniTime = 250;
      if (this.props.children.filter(x => x.key === goToPage)[0].props.animationTimeInMS) {
        aniTime = this.props.children.filter(x => x.key === goToPage)[0].props.animationTimeInMS;
      } else {
        if (this.props.animationTimeInMS) aniTime = this.props.animationTimeInMS;
      }
      options = options === undefined ? [] : options;
      var _options = options,
        _options$props = _options.props,
        props = _options$props === void 0 ? null : _options$props,
        _options$animationIn = _options.animationIn,
        animationIn = _options$animationIn === void 0 ? this.componentTransitionIn[goToPage] ? this.componentTransitionIn[goToPage] : null : _options$animationIn,
        _options$timeAnimatio = _options.timeAnimationInMS,
        timeAnimationInMS = _options$timeAnimatio === void 0 ? aniTime : _options$timeAnimatio,
        _options$animationOut = _options.animationOut,
        animationOut = _options$animationOut === void 0 ? this.swipeRight ? "slideOutRight" : this.componentTransitionOut[fromPage] ? this.componentTransitionOut[fromPage] : null : _options$animationOut,
        _options$callbackFun = _options.callbackFun,
        callbackFun = _options$callbackFun === void 0 ? null : _options$callbackFun;
      if (props !== null) {
        // let oldProps = this.state.props;
        var newProps = [];
        newProps[goToPage] = props;
        this.setState({
          props: newProps
        });
      } else {}
      if (!this.busy) {
        // const fthis = this;

        //--animation time defult
        var timeAnimation = timeAnimationInMS; //param.timeAnimationInMS !== undefined && param.timeAnimationInMS !== null ? param.timeAnimationInMS :
        //     250; //ms

        if (goToPage !== fromPage) {
          //---ניהול חזרות----//
          this.busy = true;

          ///שמור היסטוריה
          var new_historyPages = this.state.historyPages.slice();
          if (this.listLevelPages[goToPage] <= this.listLevelPages[fromPage]) {
            //חוזרים אחורה, מחק את כל הדפים שהרמה שלהם גבוהה משלי.
            //new_historyPages.splice(new_historyPages.length - 1, 1);
            new_historyPages = new_historyPages.filter(x => this.listLevelPages[x] < this.listLevelPages[goToPage]);
          }
          new_historyPages.push(goToPage);
          //שמירת שינויים בהיסטוריה
          this.setState({
            historyPages: new_historyPages
          });
          if (this.state.changeRoute) {
            window.location.href = window.location.href.substr(0, window.location.href.lastIndexOf("/") + 1) + "#" + (goToPage !== this.state.homePageKey ? goToPage : "");
          }

          //----navigator and animation----///

          if (this.listLevelPages[goToPage] > this.listLevelPages[fromPage]) {
            //--נכנסים דף פנימה Up--//
            this.funAnimationIn1(goToPage, fromPage);
            if (this.listLevelPages[goToPage] === 1) {
              //Up from level 0 to level 1
              (0, _jquery.default)("#" + goToPage).css("animation", (animationIn !== null && animationIn !== undefined ? animationIn : "slideInRight") + " " + timeAnimation + "ms");
            } else {
              //else if (this.listLevelPages[goToPage] === 2) {
              //Up from level 1 to level 2
              (0, _jquery.default)("#" + goToPage).css("animation", (animationIn !== null && animationIn !== undefined ? animationIn : "zoomIn") + " " + timeAnimation + "ms");
            }
          } else {
            //--חזרה בדפים Down--//
            this.funAnimationOut1(goToPage, fromPage);
            if (this.listLevelPages[fromPage] === 1) {
              //Down from level 1 to level 0
              (0, _jquery.default)("#" + fromPage).css("animation", (animationOut !== null && animationOut !== undefined ? animationOut : "slideOutRight") + " " + timeAnimation + "ms");
            } else {
              //else if (this.listLevelPages[goToPage] === 1) {
              //Down from level 2 to level 1
              (0, _jquery.default)("#" + fromPage).css("animation", (animationOut !== null && animationOut !== undefined ? animationOut : "zoomOut") + " " + timeAnimation + "ms");
            }
          }
          // //עיצוב כפתור חזרה
          // if (goToPage === "home") {
          //     $('#navigatorBack').css('display', "none");
          // } else {
          //     $('#navigatorBack').css('display', "flex");
          // }

          if (callbackFun !== undefined && callbackFun !== null) callbackFun();
        }
      }
    } catch (error) {
      fthis.onError(error);
    }
  }
  componentDidMount() {
    var fthis = this;
    try {
      // //---lock portrait
      // window.screen.orientation.lock('portrait');

      //--back button in android

      document.addEventListener("backbutton", e => {
        fthis.back();
      }, false);

      //--back on change browser url

      if (fthis.state.changeRoute) window.addEventListener("hashchange", function (e) {
        fthis.changePage(window.location.pathname.substr(2) === "" ? fthis.state.homePageKey : window.location.pathname.substr(2));
      });
    } catch (error) {
      fthis.onError(error);
    }
  }
  back(options) {
    var _this = this;
    return _asyncToGenerator(function* () {
      var fthis = _this;
      if (_this.props.beforBack) if (!(yield _this.props.beforBack())) return;
      console.log("navigator back with options: ", options);
      try {
        fthis.props.children.forEach(child => {
          if (child.props.kill) {
            fthis.historyPages = fthis.historyPages.filter(x => x !== child.key);
          }
        });
        fthis.setState({
          historyPages: fthis.historyPages
        });

        //---
        if (options === null || options === undefined) {
          console.log("back=> changePage to: ", fthis.state.historyPages[fthis.state.historyPages.length - 2]);
          fthis.changePage(fthis.state.historyPages[fthis.state.historyPages.length - 2]);
        } else {
          fthis.changePage(fthis.state.historyPages[fthis.state.historyPages.length - 2], options);
        }
      } catch (error) {
        fthis.onError(error);
      }
    })();
  }
  render() {
    var fthis = this;
    // window.navigation_controller = this;
    var nowPage = this.state.historyPages[this.state.historyPages.length - 1];
    this.historyPages = this.state.historyPages; //.slice();
    this.nowPage = this.state.nowPage;

    // if (Array.isArray(this.props.children)) {
    //     this.props.children.map(child => {
    //         if (fthis.state.props[child.key] !== undefined) {
    //             fthis.state.props[child.key].forEach((prop)=>{
    //                 this.props.children.filter((x)=>x.key===child.key)[0].props[prop]
    //             })
    //         }
    //     });
    // }

    return Array.isArray(this.props.children) ? this.props.children.filter(child => typeof child === "object" && !child.props.kill).map(child => {
      return /*#__PURE__*/_react.default.createElement("div", {
        // onTouchStart={(e) => {

        // }}

        onTouchMove: e => {
          if (child.props.backOnSwipeRight && !fthis.swipeRight) {
            if (e.touches[0].clientX < 0.2 * innerWidth) {
              fthis.touchBackPage = nowPage;
              fthis.swipeRight = true;
              fthis.setState({
                swipeRightStart_x: e.touches[0].clientX
              });
              var goToPage = this.state.historyPages[this.state.historyPages.length - 2];
              (0, _jquery.default)("#" + goToPage).css("z-index", 0);
              (0, _jquery.default)("#" + nowPage).css("z-index", 89);
              (0, _jquery.default)("#" + goToPage).removeClass("hiddenPage");
              (0, _jquery.default)("#" + goToPage).addClass("showPage overflow_Y_hidden");
            }
          }
          if (fthis.swipeRight) {
            fthis.setState({
              swipeRight_x: e.touches[0].clientX - fthis.state.swipeRightStart_x <= 0 ? 1 : e.touches[0].clientX - fthis.state.swipeRightStart_x
            });
          }
        },
        onTouchEnd: e => {
          var goToPage = this.state.historyPages[this.state.historyPages.length - 2];
          if (fthis.swipeRight && fthis.state.swipeRight_x > 0.25 * innerWidth) {
            fthis.callbackFunOnChangePage = () => {
              (0, _jquery.default)("#" + fthis.touchBackPage).css("left", "");
              (0, _jquery.default)("#" + goToPage).removeClass("overflow_Y_hidden");
              fthis.setState({
                swipeRight_x: 0
              });
              fthis.swipeRight = false;
              fthis.touchBackPage = "";
              fthis.callbackFunOnChangePage = () => {};
            };

            // fthis.touchBackPage = nowPage;
            fthis.back();
          } else {
            (0, _jquery.default)("#" + nowPage).css("left", "");
            (0, _jquery.default)("#" + goToPage).css("z-index", "");
            (0, _jquery.default)("#" + nowPage).css("z-index", "");
            (0, _jquery.default)("#" + goToPage).removeClass("showPage");
            (0, _jquery.default)("#" + goToPage).addClass("hiddenPage");
            fthis.setState({
              swipeRight_x: 0
            });
            fthis.swipeRight = false;
            fthis.touchBackPage = "";
          }

          // }
        },
        style: {
          left: fthis.swipeRight ? fthis.touchBackPage === child.key ? fthis.state.swipeRight_x : "" : "",
          backgroundColor: child.props.backgroundColor ? child.props.backgroundColor : "#fff",
          height: child.props.height ? child.props.height : fthis.props.height ? this.props.height : "100%"
        },
        id: child.key,
        key: child.key,
        className: fthis.state.startPage === child.key ? "showPage scrollPage" : "hiddenPage"
      }, nowPage === child.key || fthis.state.historyPages.includes(child.key) || child.props.alwaysLive ? /*#__PURE__*/_react.default.cloneElement(child, fthis.state.props[child.key], child.props.children) : null);
    }) : /*#__PURE__*/_react.default.createElement("div", {
      style: {
        backgroundColor: this.props.children.props.backgroundColor ? this.props.children.props.backgroundColor : "#fff",
        height: this.props.children.props.height ? this.props.children.props : fthis.props.height ? this.props.height : "100%"
      },
      id: this.props.children.key,
      key: this.props.children.key,
      className: fthis.state.startPage === this.props.children.key ? "showPage scrollPage" : "hiddenPage"
    }, nowPage === this.props.children.key || fthis.state.historyPages.includes(this.props.children.key) || this.props.children.props.alwaysLive ? (/*#__PURE__*/_react.default.cloneElement(this.props.children, fthis.state.props[this.props.children.key], this.props.children.props.children) // this.props.children
    ) : /*#__PURE__*/_react.default.createElement("div", null));
  }
}
exports.default = Navigator;