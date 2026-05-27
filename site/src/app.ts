// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createElement } from "specifyjs";
import { Http404 } from "../../components/errors/http-404/src/index";
import {
  Router,
  useRouter,
  FeatureFlagProvider,
  useFeatureFlags,
} from "specifyjs";
import { NavBar } from "./components/nav-bar";
import { Footer } from "./components/footer";
import { HomeScreen } from "./screens/home";
import { ComponentsGallery } from "./screens/components-gallery";
import { ConcurrentDemo } from "./screens/concurrent-demo";
import { ApiIntegration } from "./screens/api-integration";
import { ComponentReference } from "./screens/component-reference";
import { GettingStarted } from "./screens/getting-started";
import { FeatureFlagsDemo } from "./screens/feature-flags-demo";
import { DocsViewer } from "./screens/docs-viewer";
import { PendulumScreen } from "./screens/pendulum";
import { PlanetsScreen } from "./screens/planets";
import { ConwaysGameOfLife } from "./screens/conways-game-of-life";
import { RadioPropagation } from "./screens/radio-propagation";
import { WumpusWorld } from "./screens/wumpus-world";
import { Space3DDemo } from "./screens/3d-space";
import { Space3DWebGLDemo } from "./screens/3d-space-webgl";
import { ForceGraph3DDemo } from "./screens/3d-force-graph";

function AppContent() {
  const { pathname, navigate } = useRouter();
  const { isEnabled } = useFeatureFlags();

  const isHome = pathname === "/";

  const disabled = createElement(
    "div",
    { style: { textAlign: "center", padding: "48px", color: "#94a3b8" } },
    "This feature is disabled. Enable it via Feature Flags.",
  );

  // Route → { title, component, flag? }
  const routes: {
    path: string;
    title: string;
    content: ReturnType<typeof createElement>;
    flag?: string;
  }[] = [
    {
      path: "/components",
      title: "Component Gallery",
      content: createElement(ComponentsGallery, null),
    },
    {
      path: "/concurrent",
      title: "Concurrent Rendering",
      content: createElement(ConcurrentDemo, null),
      flag: "concurrent-rendering",
    },
    {
      path: "/api",
      title: "API Integration",
      content: createElement(ApiIntegration, null),
    },
    {
      path: "/reference",
      title: "Component Reference",
      content: createElement(ComponentReference, null),
    },
    {
      path: "/getting-started",
      title: "Getting Started",
      content: createElement(GettingStarted, null),
      flag: "getting-started",
    },
    {
      path: "/featureflags",
      title: "Feature Flags",
      content: createElement(FeatureFlagsDemo, null),
    },
    {
      path: "/docs",
      title: "Documentation",
      content: createElement(DocsViewer, null),
    },
    {
      path: "/pendulum",
      title: "Pendulum Physics",
      content: createElement(PendulumScreen, null),
    },
    {
      path: "/planets",
      title: "Solar System",
      content: createElement(PlanetsScreen, null),
    },
    {
      path: "/conways-game-of-life",
      title: "Conway's Game of Life",
      content: createElement(ConwaysGameOfLife, null),
    },
    {
      path: "/radio-propagation",
      title: "Radio Propagation",
      content: createElement(RadioPropagation, null),
    },
    {
      path: "/wumpus",
      title: "Wumpus World",
      content: createElement(WumpusWorld, null),
    },
    {
      path: "/3dSpaceWebGl",
      title: "3D Space (WebGL)",
      content: createElement(Space3DWebGLDemo, null),
    },
    {
      path: "/3dSpace",
      title: "3D Space",
      content: createElement(Space3DDemo, null),
    },
    {
      path: "/3dForcedGraph",
      title: "3D Force Graph",
      content: createElement(ForceGraph3DDemo, null),
    },
  ];

  let dialogTitle: string | null = null;
  let dialogContent: ReturnType<typeof createElement> | null = null;

  for (const route of routes) {
    if (pathname.startsWith(route.path)) {
      dialogTitle = route.title;
      dialogContent =
        route.flag && !isEnabled(route.flag) ? disabled : route.content;
      break;
    }
  }

  if (!isHome && dialogContent === null) {
    dialogTitle = "Not Found";
    dialogContent = createElement(Http404, null);
  }

  const handleClose = () => navigate("/");
  const handleBackdropClick = (e: Event) => {
    if ((e.target as HTMLElement).classList.contains("dialog-backdrop")) {
      handleClose();
    }
  };

  return createElement(
    "div",
    null,
    // Home page is always present as the base layer
    createElement(
      "main",
      { className: "main-content" },
      createElement(HomeScreen, null),
    ),
    // Dialog overlay for non-home screens
    !isHome && dialogContent
      ? createElement(
          "div",
          {
            className: "dialog-backdrop",
            role: "presentation",
            onClick: handleBackdropClick,
          },
          createElement(
            "div",
            { className: "dialog-panel" },
            createElement(
              "div",
              { className: "dialog-header" },
              createElement("h2", { className: "dialog-title" }, dialogTitle),
              createElement(
                "button",
                {
                  className: "dialog-close",
                  onClick: handleClose,
                  "aria-label": "Close",
                },
                "\u00d7",
              ),
            ),
            createElement("div", { className: "dialog-body" }, dialogContent),
          ),
        )
      : null,
    createElement(Footer, null),
  );
}

export function App() {
  return createElement(
    FeatureFlagProvider,
    { url: "./features.json" },
    createElement(
      Router,
      null,
      createElement(NavBar, null),
      createElement(AppContent, null),
    ),
  );
}
