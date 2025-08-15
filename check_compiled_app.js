import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/App.tsx?v=1");import.meta.env = {"BASE_URL": "/", "DEV": true, "MODE": "development", "PROD": false, "SSR": false, "VITE_APP": "dashboard", "VITE_PORT": "5174"};import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=a21abb8a"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
let prevRefreshReg;
let prevRefreshSig;
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/app/src/App.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}
import mainLogo from "/img/light_logo.png?import";
const page = import.meta.env.VITE_APP || "home";
const Home = () => /* @__PURE__ */ jsxDEV("div", { className: "app-hero", children: [
  /* @__PURE__ */ jsxDEV("div", { className: "app-content text-center", children: [
    /* @__PURE__ */ jsxDEV("header", { children: /* @__PURE__ */ jsxDEV("div", { className: "glass-card hero-card", children: [
      /* @__PURE__ */ jsxDEV("img", { src: mainLogo, alt: "Main Logo", style: { height: "115px", marginBottom: "0.3rem" } }, void 0, false, {
        fileName: "/app/src/App.tsx",
        lineNumber: 30,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("h2", { className: "hero-title", children: "Business Intelligence" }, void 0, false, {
        fileName: "/app/src/App.tsx",
        lineNumber: 31,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/app/src/App.tsx",
      lineNumber: 29,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/app/src/App.tsx",
      lineNumber: 28,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("main", { children: /* @__PURE__ */ jsxDEV("div", { className: "buttons-row", children: [
      /* @__PURE__ */ jsxDEV("a", { href: "http://localhost:5176", className: "btn btn-primary", children: "Controle de Ponto" }, void 0, false, {
        fileName: "/app/src/App.tsx",
        lineNumber: 36,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("a", { href: "http://localhost:5174", className: "btn btn-primary", children: "Painel Gerencial" }, void 0, false, {
        fileName: "/app/src/App.tsx",
        lineNumber: 37,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("a", { href: "http://localhost:5175", className: "btn btn-primary", children: "Central de Clientes" }, void 0, false, {
        fileName: "/app/src/App.tsx",
        lineNumber: 38,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/app/src/App.tsx",
      lineNumber: 35,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/app/src/App.tsx",
      lineNumber: 34,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/app/src/App.tsx",
    lineNumber: 27,
    columnNumber: 5
  }, this),
  /* @__PURE__ */ jsxDEV("footer", { className: "app-footer", children: /* @__PURE__ */ jsxDEV("p", { className: "hero-subtitle", children: "SaaS Platform" }, void 0, false, {
    fileName: "/app/src/App.tsx",
    lineNumber: 43,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "/app/src/App.tsx",
    lineNumber: 42,
    columnNumber: 5
  }, this)
] }, void 0, true, {
  fileName: "/app/src/App.tsx",
  lineNumber: 26,
  columnNumber: 1
}, this);
_c = Home;
const Dashboard = () => {
  const mockData = {
    kpis: {
      averageLtv: 15e3,
      newClientCount: 42,
      conversionRate: 18.5,
      totalRevenue: 85e4,
      averageClientLifespan: 365,
      monthlyChurnRate: 5.2,
      dataQualityScore: 95,
      roi: 3.2
    },
    funnel: [],
    leadEvolution: [],
    checkIn: [],
    ltv: [],
    cohort: []
  };
  return /* @__PURE__ */ jsxDEV("div", { style: { padding: "20px", backgroundColor: "#1E1E1E", minHeight: "100vh", color: "#fff" }, children: [
    /* @__PURE__ */ jsxDEV("h1", { style: { color: "#9EFF00", textAlign: "center", marginBottom: "20px" }, children: "Dashboard - Painel Gerencial" }, void 0, false, {
      fileName: "/app/src/App.tsx",
      lineNumber: 71,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("p", { style: { textAlign: "center", marginBottom: "40px" }, children: "Real BI Dashboard coming soon..." }, void 0, false, {
      fileName: "/app/src/App.tsx",
      lineNumber: 72,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" }, children: [
      /* @__PURE__ */ jsxDEV("div", { style: { background: "rgba(158, 255, 0, 0.1)", padding: "20px", borderRadius: "8px", border: "1px solid #9EFF00" }, children: [
        /* @__PURE__ */ jsxDEV("h3", { children: "LTV MÃ©dio" }, void 0, false, {
          fileName: "/app/src/App.tsx",
          lineNumber: 77,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { style: { fontSize: "24px", color: "#9EFF00" }, children: [
          "R$ ",
          mockData.kpis.averageLtv.toLocaleString()
        ] }, void 0, true, {
          fileName: "/app/src/App.tsx",
          lineNumber: 78,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/app/src/App.tsx",
        lineNumber: 76,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { background: "rgba(158, 255, 0, 0.1)", padding: "20px", borderRadius: "8px", border: "1px solid #9EFF00" }, children: [
        /* @__PURE__ */ jsxDEV("h3", { children: "Novos Clientes" }, void 0, false, {
          fileName: "/app/src/App.tsx",
          lineNumber: 81,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { style: { fontSize: "24px", color: "#9EFF00" }, children: mockData.kpis.newClientCount }, void 0, false, {
          fileName: "/app/src/App.tsx",
          lineNumber: 82,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/app/src/App.tsx",
        lineNumber: 80,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { background: "rgba(158, 255, 0, 0.1)", padding: "20px", borderRadius: "8px", border: "1px solid #9EFF00" }, children: [
        /* @__PURE__ */ jsxDEV("h3", { children: "Taxa ConversÃ£o" }, void 0, false, {
          fileName: "/app/src/App.tsx",
          lineNumber: 85,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { style: { fontSize: "24px", color: "#9EFF00" }, children: [
          mockData.kpis.conversionRate,
          "%"
        ] }, void 0, true, {
          fileName: "/app/src/App.tsx",
          lineNumber: 86,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/app/src/App.tsx",
        lineNumber: 84,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { background: "rgba(158, 255, 0, 0.1)", padding: "20px", borderRadius: "8px", border: "1px solid #9EFF00" }, children: [
        /* @__PURE__ */ jsxDEV("h3", { children: "Receita Total" }, void 0, false, {
          fileName: "/app/src/App.tsx",
          lineNumber: 89,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { style: { fontSize: "24px", color: "#9EFF00" }, children: [
          "R$ ",
          mockData.kpis.totalRevenue.toLocaleString()
        ] }, void 0, true, {
          fileName: "/app/src/App.tsx",
          lineNumber: 90,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/app/src/App.tsx",
        lineNumber: 88,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/app/src/App.tsx",
      lineNumber: 75,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("p", { style: { textAlign: "center", fontSize: "12px", opacity: 0.7 }, children: "Powered by BASE Business Intelligence" }, void 0, false, {
      fileName: "/app/src/App.tsx",
      lineNumber: 94,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/app/src/App.tsx",
    lineNumber: 70,
    columnNumber: 5
  }, this);
};
_c2 = Dashboard;
const Cliente = () => /* @__PURE__ */ jsxDEV("h1", { style: { color: "#9EFF00", textAlign: "center" }, children: "Central de Clientes (VITE_APP=cliente)" }, void 0, false, {
  fileName: "/app/src/App.tsx",
  lineNumber: 98,
  columnNumber: 23
}, this);
_c3 = Cliente;
const Schedule = () => /* @__PURE__ */ jsxDEV("h1", { style: { color: "#9EFF00", textAlign: "center" }, children: "Controle de Ponto (VITE_APP=schedule)" }, void 0, false, {
  fileName: "/app/src/App.tsx",
  lineNumber: 99,
  columnNumber: 24
}, this);
_c4 = Schedule;
const App = () => {
  switch (page) {
    case "dashboard":
      return /* @__PURE__ */ jsxDEV(Dashboard, {}, void 0, false, {
        fileName: "/app/src/App.tsx",
        lineNumber: 104,
        columnNumber: 14
      }, this);
    case "cliente":
      return /* @__PURE__ */ jsxDEV(Cliente, {}, void 0, false, {
        fileName: "/app/src/App.tsx",
        lineNumber: 106,
        columnNumber: 14
      }, this);
    case "schedule":
      return /* @__PURE__ */ jsxDEV(Schedule, {}, void 0, false, {
        fileName: "/app/src/App.tsx",
        lineNumber: 108,
        columnNumber: 14
      }, this);
    default:
      return /* @__PURE__ */ jsxDEV(Home, {}, void 0, false, {
        fileName: "/app/src/App.tsx",
        lineNumber: 110,
        columnNumber: 14
      }, this);
  }
};
_c5 = App;
export default App;
var _c, _c2, _c3, _c4, _c5;
$RefreshReg$(_c, "Home");
$RefreshReg$(_c2, "Dashboard");
$RefreshReg$(_c3, "Cliente");
$RefreshReg$(_c4, "Schedule");
$RefreshReg$(_c5, "App");
if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}
if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/app/src/App.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/app/src/App.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,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LEtBQUFFLEtBQUFFO0FBQUFDLGFBQUF0QyxJQUFBO0FBQUFzQyxhQUFBUCxLQUFBO0FBQUFPLGFBQUFMLEtBQUE7QUFBQUssYUFBQUgsS0FBQTtBQUFBRyxhQUFBRCxLQUFBIiwibmFtZXMiOlsibWFpbkxvZ28iLCJwYWdlIiwiaW1wb3J0IiwiZW52IiwiVklURV9BUFAiLCJIb21lIiwiaGVpZ2h0IiwibWFyZ2luQm90dG9tIiwiX2MiLCJEYXNoYm9hcmQiLCJtb2NrRGF0YSIsImtwaXMiLCJhdmVyYWdlTHR2IiwibmV3Q2xpZW50Q291bnQiLCJjb252ZXJzaW9uUmF0ZSIsInRvdGFsUmV2ZW51ZSIsImF2ZXJhZ2VDbGllbnRMaWZlc3BhbiIsIm1vbnRobHlDaHVyblJhdGUiLCJkYXRhUXVhbGl0eVNjb3JlIiwicm9pIiwiZnVubmVsIiwibGVhZEV2b2x1dGlvbiIsImNoZWNrSW4iLCJsdHYiLCJjb2hvcnQiLCJwYWRkaW5nIiwiYmFja2dyb3VuZENvbG9yIiwibWluSGVpZ2h0IiwiY29sb3IiLCJ0ZXh0QWxpZ24iLCJkaXNwbGF5IiwiZ3JpZFRlbXBsYXRlQ29sdW1ucyIsImdhcCIsImJhY2tncm91bmQiLCJib3JkZXJSYWRpdXMiLCJib3JkZXIiLCJmb250U2l6ZSIsInRvTG9jYWxlU3RyaW5nIiwib3BhY2l0eSIsIl9jMiIsIkNsaWVudGUiLCJfYzMiLCJTY2hlZHVsZSIsIl9jNCIsIkFwcCIsIl9jNSIsIiRSZWZyZXNoUmVnJCJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlcyI6WyJBcHAudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCBtYWluTG9nbyBmcm9tICcvaW1nL2xpZ2h0X2xvZ28ucG5nJztcclxuXHJcbmNvbnN0IHBhZ2UgPSBpbXBvcnQubWV0YS5lbnYuVklURV9BUFAgfHwgJ2hvbWUnO1xyXG5cclxuY29uc3QgSG9tZSA9ICgpID0+IChcclxuICA8ZGl2IGNsYXNzTmFtZT1cImFwcC1oZXJvXCI+XHJcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImFwcC1jb250ZW50IHRleHQtY2VudGVyXCI+XHJcbiAgICAgIDxoZWFkZXI+XHJcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJnbGFzcy1jYXJkIGhlcm8tY2FyZFwiPlxyXG4gICAgICAgICAgPGltZyBzcmM9e21haW5Mb2dvfSBhbHQ9XCJNYWluIExvZ29cIiBzdHlsZT17eyBoZWlnaHQ6ICcxMTVweCcsIG1hcmdpbkJvdHRvbTogJzAuM3JlbScgfX0gLz5cclxuICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJoZXJvLXRpdGxlXCI+QnVzaW5lc3MgSW50ZWxsaWdlbmNlPC9oMj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9oZWFkZXI+XHJcbiAgICAgIDxtYWluPlxyXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnV0dG9ucy1yb3dcIj5cclxuICAgICAgICAgIDxhIGhyZWY9XCJodHRwOi8vbG9jYWxob3N0OjUxNzZcIiBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnlcIj5Db250cm9sZSBkZSBQb250bzwvYT5cclxuICAgICAgICAgIDxhIGhyZWY9XCJodHRwOi8vbG9jYWxob3N0OjUxNzRcIiBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnlcIj5QYWluZWwgR2VyZW5jaWFsPC9hPlxyXG4gICAgICAgICAgPGEgaHJlZj1cImh0dHA6Ly9sb2NhbGhvc3Q6NTE3NVwiIGNsYXNzTmFtZT1cImJ0biBidG4tcHJpbWFyeVwiPkNlbnRyYWwgZGUgQ2xpZW50ZXM8L2E+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvbWFpbj5cclxuICAgIDwvZGl2PlxyXG4gICAgPGZvb3RlciBjbGFzc05hbWU9XCJhcHAtZm9vdGVyXCI+XHJcbiAgICAgIDxwIGNsYXNzTmFtZT1cImhlcm8tc3VidGl0bGVcIj5TYWFTIFBsYXRmb3JtPC9wPlxyXG4gICAgPC9mb290ZXI+XHJcbiAgPC9kaXY+XHJcbik7XHJcblxyXG4vLyBJbXBvcnQgcmVhbCBEYXNoYm9hcmRcclxuY29uc3QgRGFzaGJvYXJkID0gKCkgPT4ge1xyXG4gIC8vIE1vY2sgZGF0YSBmb3Igbm93IC0gcmVwbGFjZSB3aXRoIHJlYWwgQVBJIGNhbGxzXHJcbiAgY29uc3QgbW9ja0RhdGEgPSB7XHJcbiAgICBrcGlzOiB7XHJcbiAgICAgIGF2ZXJhZ2VMdHY6IDE1MDAwLFxyXG4gICAgICBuZXdDbGllbnRDb3VudDogNDIsXHJcbiAgICAgIGNvbnZlcnNpb25SYXRlOiAxOC41LFxyXG4gICAgICB0b3RhbFJldmVudWU6IDg1MDAwMCxcclxuICAgICAgYXZlcmFnZUNsaWVudExpZmVzcGFuOiAzNjUsXHJcbiAgICAgIG1vbnRobHlDaHVyblJhdGU6IDUuMixcclxuICAgICAgZGF0YVF1YWxpdHlTY29yZTogOTUsXHJcbiAgICAgIHJvaTogMy4yXHJcbiAgICB9LFxyXG4gICAgZnVubmVsOiBbXSxcclxuICAgIGxlYWRFdm9sdXRpb246IFtdLFxyXG4gICAgY2hlY2tJbjogW10sXHJcbiAgICBsdHY6IFtdLFxyXG4gICAgY29ob3J0OiBbXVxyXG4gIH07XHJcbiAgXHJcbiAgcmV0dXJuIChcclxuICAgIDxkaXYgc3R5bGU9e3twYWRkaW5nOiAnMjBweCcsIGJhY2tncm91bmRDb2xvcjogJyMxRTFFMUUnLCBtaW5IZWlnaHQ6ICcxMDB2aCcsIGNvbG9yOiAnI2ZmZid9fT5cclxuICAgICAgPGgxIHN0eWxlPXt7Y29sb3I6JyM5RUZGMDAnLCB0ZXh0QWxpZ246J2NlbnRlcicsIG1hcmdpbkJvdHRvbTogJzIwcHgnfX0+RGFzaGJvYXJkIC0gUGFpbmVsIEdlcmVuY2lhbDwvaDE+XHJcbiAgICAgIDxwIHN0eWxlPXt7dGV4dEFsaWduOiAnY2VudGVyJywgbWFyZ2luQm90dG9tOiAnNDBweCd9fT5SZWFsIEJJIERhc2hib2FyZCBjb21pbmcgc29vbi4uLjwvcD5cclxuICAgICAgXHJcbiAgICAgIHsvKiBLUEkgUHJldmlldyAqL31cclxuICAgICAgPGRpdiBzdHlsZT17e2Rpc3BsYXk6ICdncmlkJywgZ3JpZFRlbXBsYXRlQ29sdW1uczogJ3JlcGVhdChhdXRvLWZpdCwgbWlubWF4KDIwMHB4LCAxZnIpKScsIGdhcDogJzIwcHgnLCBtYXJnaW5Cb3R0b206ICc0MHB4J319PlxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3tiYWNrZ3JvdW5kOiAncmdiYSgxNTgsIDI1NSwgMCwgMC4xKScsIHBhZGRpbmc6ICcyMHB4JywgYm9yZGVyUmFkaXVzOiAnOHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICM5RUZGMDAnfX0+XHJcbiAgICAgICAgICA8aDM+TFRWIE3DqWRpbzwvaDM+XHJcbiAgICAgICAgICA8cCBzdHlsZT17e2ZvbnRTaXplOiAnMjRweCcsIGNvbG9yOiAnIzlFRkYwMCd9fT5SJCB7bW9ja0RhdGEua3Bpcy5hdmVyYWdlTHR2LnRvTG9jYWxlU3RyaW5nKCl9PC9wPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3tiYWNrZ3JvdW5kOiAncmdiYSgxNTgsIDI1NSwgMCwgMC4xKScsIHBhZGRpbmc6ICcyMHB4JywgYm9yZGVyUmFkaXVzOiAnOHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICM5RUZGMDAnfX0+XHJcbiAgICAgICAgICA8aDM+Tm92b3MgQ2xpZW50ZXM8L2gzPlxyXG4gICAgICAgICAgPHAgc3R5bGU9e3tmb250U2l6ZTogJzI0cHgnLCBjb2xvcjogJyM5RUZGMDAnfX0+e21vY2tEYXRhLmtwaXMubmV3Q2xpZW50Q291bnR9PC9wPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3tiYWNrZ3JvdW5kOiAncmdiYSgxNTgsIDI1NSwgMCwgMC4xKScsIHBhZGRpbmc6ICcyMHB4JywgYm9yZGVyUmFkaXVzOiAnOHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICM5RUZGMDAnfX0+XHJcbiAgICAgICAgICA8aDM+VGF4YSBDb252ZXJzw6NvPC9oMz5cclxuICAgICAgICAgIDxwIHN0eWxlPXt7Zm9udFNpemU6ICcyNHB4JywgY29sb3I6ICcjOUVGRjAwJ319Pnttb2NrRGF0YS5rcGlzLmNvbnZlcnNpb25SYXRlfSU8L3A+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBzdHlsZT17e2JhY2tncm91bmQ6ICdyZ2JhKDE1OCwgMjU1LCAwLCAwLjEpJywgcGFkZGluZzogJzIwcHgnLCBib3JkZXJSYWRpdXM6ICc4cHgnLCBib3JkZXI6ICcxcHggc29saWQgIzlFRkYwMCd9fT5cclxuICAgICAgICAgIDxoMz5SZWNlaXRhIFRvdGFsPC9oMz5cclxuICAgICAgICAgIDxwIHN0eWxlPXt7Zm9udFNpemU6ICcyNHB4JywgY29sb3I6ICcjOUVGRjAwJ319PlIkIHttb2NrRGF0YS5rcGlzLnRvdGFsUmV2ZW51ZS50b0xvY2FsZVN0cmluZygpfTwvcD5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcbiAgICAgIFxyXG4gICAgICA8cCBzdHlsZT17e3RleHRBbGlnbjogJ2NlbnRlcicsIGZvbnRTaXplOiAnMTJweCcsIG9wYWNpdHk6IDAuN319PlBvd2VyZWQgYnkgQkFTRSBCdXNpbmVzcyBJbnRlbGxpZ2VuY2U8L3A+XHJcbiAgICA8L2Rpdj5cclxuICApO1xyXG59O1xyXG5jb25zdCBDbGllbnRlID0gKCkgPT4gPGgxIHN0eWxlPXt7Y29sb3I6JyM5RUZGMDAnLHRleHRBbGlnbjonY2VudGVyJ319PkNlbnRyYWwgZGUgQ2xpZW50ZXMgKFZJVEVfQVBQPWNsaWVudGUpPC9oMT47XHJcbmNvbnN0IFNjaGVkdWxlID0gKCkgPT4gPGgxIHN0eWxlPXt7Y29sb3I6JyM5RUZGMDAnLHRleHRBbGlnbjonY2VudGVyJ319PkNvbnRyb2xlIGRlIFBvbnRvIChWSVRFX0FQUD1zY2hlZHVsZSk8L2gxPjtcclxuXHJcbmNvbnN0IEFwcDogUmVhY3QuRkMgPSAoKSA9PiB7XHJcbiAgc3dpdGNoIChwYWdlKSB7XHJcbiAgICBjYXNlICdkYXNoYm9hcmQnOlxyXG4gICAgICByZXR1cm4gPERhc2hib2FyZCAvPjtcclxuICAgIGNhc2UgJ2NsaWVudGUnOlxyXG4gICAgICByZXR1cm4gPENsaWVudGUgLz47XHJcbiAgICBjYXNlICdzY2hlZHVsZSc6XHJcbiAgICAgIHJldHVybiA8U2NoZWR1bGUgLz47XHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICByZXR1cm4gPEhvbWUgLz47XHJcbiAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQXBwO1xyXG4iXSwiZmlsZSI6Ii9hcHAvc3JjL0FwcC50c3gifQ==
