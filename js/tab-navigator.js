define((require, exports, module) => {
  "use strict";

  const React = require("react")
  const DOM  = React.DOM

  const Tab = React.createClass({
    closeTab() {
      this.props.closeTab(this.props.frame)
    },
    selectTab() {
      this.props.selectTab(this.props.frame)
    },

    onMouseUp({button}) {
      if (button == 1) {
        this.closeTab()
      }
    },

    render() {
      const { id, selected, title, favicon, loading, url } = this.props.frame

      const classList = ["tab", "hbox", "align", "center",
                         loading ? "loading" : "loaded"]

      return DOM.div({
        className: classList.join(" "),
        key: `tab-${id}`
      }, [
        DOM.div({className: "throbber"}),
        DOM.img(Object.assign({className: "favicon"},
                              favicon ? {src: favicon} : {})),
        DOM.div({className: "title hbox",
                 onMouseDown: this.selectTab,
                 onMouseUp: this.onMouseUp},
                title),
        DOM.button({className: "close-button",
                    onMouseUp: this.closeTab})
      ])
    }
  })
  exports.Tab = Tab

  function BuildCurvedTabs() {
    let curveDummyElt = document.querySelector('.dummy-tab-curve');
    let style = window.getComputedStyle(curveDummyElt);

    let curveBorder = style.getPropertyValue('--curve-border');
    let curveGradientStart = style.getPropertyValue('--curve-gradient-start');
    let curveGradientEnd = style.getPropertyValue('--curve-gradient-end');
    let curveHoverBorder = style.getPropertyValue('--curve-hover-border');
    let curveHoverGradientStart = style.getPropertyValue('--curve-hover-gradient-start');
    let curveHoverGradientEnd = style.getPropertyValue('--curve-hover-gradient-end');

    let c1 = document.createElement('canvas');
        c1.id = 'canvas-tab-selected';
        c1.hidden = true;
        c1.width = 3 * 28;
        c1.height = 28;
    drawBackgroundTab(c1, curveGradientStart, curveGradientEnd, curveBorder);
    document.body.appendChild(c1);

    let c2 = document.createElement('canvas');
        c2.id = 'canvas-tab-hover';
        c2.hidden = true;
        c2.width = 3 * 28;
        c2.height = 28;
    drawBackgroundTab(c2, curveHoverGradientStart, curveHoverGradientEnd, curveHoverBorder);
    document.body.appendChild(c2);


    function drawBackgroundTab(canvas, bg1, bg2, borderColor) {
      canvas.width = window.devicePixelRatio * canvas.width;
      canvas.height = window.devicePixelRatio * canvas.height;
      let ctx = canvas.getContext('2d');
      let r = canvas.height;
      ctx.save();
      ctx.beginPath();
      drawCurve(ctx,r);
      ctx.lineTo(3 * r, r);
      ctx.lineTo(0, r);
      ctx.closePath();
      ctx.clip();

      // draw background
      let lingrad = ctx.createLinearGradient(0,0,0,r);
      lingrad.addColorStop(0, bg1);
      lingrad.addColorStop(1, bg2);
      ctx.fillStyle = lingrad;
      ctx.fillRect(0,0,3*r,r);

      // draw border
      ctx.restore();
      ctx.beginPath();
      drawCurve(ctx,r);
      ctx.strokeStyle = borderColor;
      ctx.stroke();
    }

    function drawCurve(ctx,r) {
      let firstLine = 1 / window.devicePixelRatio;
      ctx.moveTo(r * 0, r * 0.984);
      ctx.bezierCurveTo(r * 0.27082458, r * 0.95840561,
                        r * 0.3853096, r * 0.81970962,
                        r * 0.43499998, r * 0.5625);
      ctx.bezierCurveTo(r * 0.46819998, r * 0.3905,
                        r * 0.485, r * 0.0659,
                        r * 0.95,  firstLine);
      ctx.lineTo(r + r * 1.05, firstLine);
      ctx.bezierCurveTo(3 * r - r * 0.485, r * 0.0659,
                        3 * r - r * 0.46819998, r * 0.3905,
                        3 * r - r * 0.43499998, r * 0.5625);
      ctx.bezierCurveTo(3 * r - r * 0.3853096, r * 0.81970962,
                        3 * r - r * 0.27082458, r * 0.95840561,
                        3 * r - r * 0, r * 0.984);
    }
  }

  const TabNavigator = React.createClass({
    componentWillMount() {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "css/tabstrip.css";
      link.id = "tab-navigator-style";

      const defaultStyleSheet = document.querySelector('link[title=default]');
      document.head.insertBefore(link, defaultStyleSheet.nextSibling);

      link.addEventListener("load", this.onStyleReady)
    },
    componentWillUnmount() {
      document.getElementById("tab-navigator-style").remove();
    },
    onStyleReady(event) {
      event.target.removeEventListener("load", this.onStyleReady);
      BuildCurvedTabs();
    },

    closeTab(frame) {
      this.props.closeTab(frame)
    },
    selectTab(frame) {
      this.props.selectTab(frame)
    },

    renderTab(frame) {
      return React.createElement(Tab, {
        frame,
        closeTab: this.closeTab,
        selectTab: this.selectTab,
      })
    },
    render() {
      const tabs = this.props.frames.map(this.renderTab)
      return DOM.div({
        className: "tabstrip toolbar hbox"
      }, tabs)
    }
  })

  exports.TabNavigator = TabNavigator
});
