// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createElement, FeatureGate, useFeatureFlags } from "specifyjs";
import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useHead,
} from "specifyjs/hooks";
// Page layout components
import { UnityDesktop } from "../../../components/page/unity-desktop/src/index";
import { WordProcessor } from "../../../components/page/word-processor/src/index";
import { IDE } from "../../../components/page/ide/src/index";
import { TradingDashboard } from "../../../components/page/trading-dashboard/src/index";
// Form components
import { Button } from "../../../components/form/button/src/index";
import { Toggle } from "../../../components/form/toggle/src/index";
import { TextField } from "../../../components/form/textfield/src/index";
import { Checkbox } from "../../../components/form/checkbox/src/index";
import { RadioGroup } from "../../../components/form/radio/src/index";
import { Select } from "../../../components/form/select/src/index";
import { Slider } from "../../../components/form/slider/src/index";
import { NumberSpinner } from "../../../components/form/number-spinner/src/index";
import { ColorPicker } from "../../../components/form/color-picker/src/index";
import { DatePicker } from "../../../components/form/datepicker/src/index";
import { TimePicker } from "../../../components/form/timepicker/src/index";
import { FileUpload } from "../../../components/form/file-upload/src/index";
import { MultilineField } from "../../../components/form/multiline/src/index";
import { TextEditor } from "../../../components/form/texteditor/src/index";
// Data display components
import { Badge } from "../../../components/data/badge/src/index";
import { Tag } from "../../../components/data/tag/src/index";
import { DataGrid } from "../../../components/data/data-grid/src/index";
import { Avatar } from "../../../components/data/avatar/src/index";
import { ListView } from "../../../components/data/list-view/src/index";
import { VirtualScroll } from "../../../components/data/virtual-scroll/src/index";
import { DigitalClock } from "../../../components/data/digital-clock/src/index";
import { AnalogClock } from "../../../components/data/analog-clock/src/index";
// Feedback components
import { Alert } from "../../../components/feedback/alert/src/index";
import { ProgressBar } from "../../../components/feedback/progress-bar/src/index";
import { Spinner } from "../../../components/feedback/spinner/src/index";
// Navigation components
import { Tabs } from "../../../components/layout/tabs/src/index";
import { Breadcrumb } from "../../../components/nav/breadcrumb/src/index";
import { Pagination } from "../../../components/nav/pagination/src/index";
import { Dropdown } from "../../../components/nav/dropdown/src/index";
import { Menubar } from "../../../components/nav/menubar/src/index";
import { Sidebar } from "../../../components/nav/sidebar/src/index";
import { Stepper } from "../../../components/nav/stepper/src/index";
import { Toolbar } from "../../../components/nav/toolbar/src/index";
import { TreeNav } from "../../../components/nav/treenav/src/index";
// Layout components
import { Card } from "../../../components/layout/card/src/index";
import { FlexContainer } from "../../../components/layout/flex-container/src/index";
import { Grid } from "../../../components/layout/grid/src/index";
import { Panel } from "../../../components/layout/panel/src/index";
import { ScrollContainer } from "../../../components/layout/scroll-container/src/index";
import { Splitter } from "../../../components/layout/splitter/src/index";
// Visualization components
import { BarGraph } from "../../../components/viz/2D-bar-graph/src/index";
import { LineGraph } from "../../../components/viz/2D-line-graph/src/index";
import { CartesianGraph2D } from "../../../components/viz/2D-cartesian-raw/src/index";
import {
  ComplexGraph2D,
  computeMandelbrotGrid,
} from "../../../components/viz/2D-complex-graph/src/index";
import { PolarGraph2D } from "../../../components/viz/2D-polar-graph/src/index";
import { HypercubeGraph } from "../../../components/viz/graph/src/index";
import { PieGraph } from "../../../components/viz/2D-pie-graph/src/index";
import { Histogram } from "../../../components/viz/histogram/src/index";
import { LollipopChart } from "../../../components/viz/lollipop/src/index";
import { WaterfallChart } from "../../../components/viz/waterfall/src/index";
import { FunnelChart } from "../../../components/viz/funnel/src/index";
import { BubbleChart } from "../../../components/viz/bubble-chart/src/index";
import { BoxPlot } from "../../../components/viz/box-plot/src/index";
import { BigNumber } from "../../../components/viz/big-number/src/index";
import { Gauge } from "../../../components/viz/gauge/src/index";
import { RadarChart } from "../../../components/viz/radar-chart/src/index";
import { WordCloud } from "../../../components/viz/word-cloud/src/index";
import { HeatMap } from "../../../components/viz/heat-map/src/index";
import { CalendarHeatMap } from "../../../components/viz/calendar-heat-map/src/index";
import { Matrix } from "../../../components/viz/matrix/src/index";
import { GanttChart } from "../../../components/viz/gantt-chart/src/index";
import { TreeMap } from "../../../components/viz/tree-map/src/index";
import { Sunburst } from "../../../components/viz/sunburst/src/index";
import { Partition } from "../../../components/viz/partition/src/index";
import { PivotTable } from "../../../components/viz/pivot-table/src/index";
import { ForceGraph, type ForceSimNode, type ForceEdge as ForceEdgeType, type MousePosition } from "../../../components/viz/force-graph/src/index";
import { matN, matNSet, matNGet } from "../../../core/src/math/mat";
import { solve } from "../../../core/src/math/solver";
import { SankeyDiagram } from "../../../components/viz/sankey/src/index";
import { ChordDiagram } from "../../../components/viz/chord/src/index";
import { DecompositionTree } from "../../../components/viz/decomposition-tree/src/index";
import {
  GeoMap,
  generateUSMapOutline,
} from "../../../components/viz/geo-map/src/index";
import { VectorField } from "../../../components/viz/vector-field/src/index";
import { ThreeDLayers } from "../../../components/viz/3d-layers/src/index";

const REPO_BASE = "https://github.com/asymmetric-effort/specifyjs/tree/main";

function preview(
  title: string,
  comp: () => ReturnType<typeof createElement>,
  sourceDir?: string,
) {
  return createElement(PreviewCard, { title, component: comp, sourceDir });
}

function PreviewCard(props: {
  title: string;
  component: () => ReturnType<typeof createElement>;
  sourceDir?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [maximized, setMaximized] = useState(false);

  const cardStyle: Record<string, string> = maximized
    ? {
        position: "fixed",
        inset: "0",
        zIndex: "200",
        background: "var(--color-bg)",
        borderRadius: "0",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
      }
    : {};
  const bodyStyle: Record<string, string> = maximized
    ? { flex: "1", overflow: "auto", padding: "20px" }
    : {};

  return createElement(
    "div",
    { className: "preview-card", style: cardStyle },
    createElement(
      "div",
      {
        className: "preview-header",
        role: "button",
        tabIndex: 0,
        "aria-expanded": collapsed ? "false" : "true",
        onDblClick: () => setCollapsed(!collapsed),
        onKeyDown: (e: Event) => {
          if ((e as KeyboardEvent).key === "Enter") setCollapsed(!collapsed);
        },
        style: {
          cursor: "pointer",
          userSelect: "none",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        },
      },
      createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: "8px" } },
        props.title,
        props.sourceDir
          ? createElement(
              "a",
              {
                href: `${REPO_BASE}/${props.sourceDir}`,
                target: "_blank",
                rel: "noopener noreferrer",
                onClick: (e: Event) => e.stopPropagation(),
                title: "View source on GitHub",
                style: {
                  fontSize: "11px",
                  color: "#94a3b8",
                  textDecoration: "none",
                  opacity: "0.7",
                },
              },
              "\ud83d\udcbb",
            )
          : null,
      ),
      createElement(
        "span",
        { style: { display: "flex", gap: "8px", alignItems: "center" } },
        createElement(
          "span",
          {
            role: "button",
            tabIndex: 0,
            "aria-label": maximized ? "Minimize" : "Maximize",
            onClick: (e: Event) => {
              e.stopPropagation();
              setMaximized(!maximized);
            },
            onKeyDown: (e: Event) => {
              if ((e as KeyboardEvent).key === "Enter") {
                e.stopPropagation();
                setMaximized(!maximized);
              }
            },
            style: {
              fontSize: "12px",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "0 4px",
            },
            title: maximized ? "Minimize" : "Maximize",
          },
          maximized ? "\u2716" : "\u26f6",
        ),
        createElement(
          "span",
          { style: { fontSize: "10px", color: "#94a3b8" } },
          collapsed ? "\u25b6" : "\u25bc",
        ),
      ),
    ),
    collapsed
      ? null
      : createElement(
          "div",
          { className: "preview-body", style: bodyStyle },
          createElement(props.component, null),
        ),
  );
}

export function ComponentsGallery() {
  useHead({
    title: "Component Gallery — SpecifyJS",
    description:
      "Live interactive previews of 80+ SpecifyJS components: forms, data display, charts, visualizations.",
    keywords:
      "specifyjs, components, gallery, visualization, charts, forms, interactive",
    author: "Asymmetric Effort, LLC",
  });

  const [openSection, setOpenSection] = useState<string | null>(
    "Form Components",
  );

  const toggle = useCallback(
    ((...args: unknown[]) => {
      const name = args[0] as string;
      setOpenSection((prev: string | null) => (prev === name ? null : name));
    }) as (...args: unknown[]) => unknown,
    [],
  ) as (name: string) => void;

  return createElement(
    "div",
    { className: "accordion" },
    accordionSection("Form Components", "17 components", openSection, toggle, [
      preview("Toggle", ToggleDemo, "components/form/toggle"),
      preview("Text Input", TextInputDemo, "components/form/textfield"),
      preview("Checkbox", CheckboxDemo, "components/form/checkbox"),
      preview("Radio Group", RadioGroupDemo, "components/form/radio"),
      preview("Select", SelectDemo, "components/form/select"),
      preview("Slider", SliderDemo, "components/form/slider"),
      preview(
        "Number Spinner",
        NumberSpinnerDemo,
        "components/form/number-spinner",
      ),
      preview("Color Picker", ColorPickerDemo, "components/form/color-picker"),
      preview("Date Picker", DatePickerDemo, "components/form/datepicker"),
      preview("Time Picker", TimePickerDemo, "components/form/timepicker"),
      preview("File Upload", FileUploadDemo, "components/form/file-upload"),
      preview("Multiline", MultilineDemo, "components/form/multiline"),
      preview("Text Editor", TextEditorDemo, "components/form/texteditor"),
      preview("Sign Up Form", SignUpFormDemo),
      preview("Settings Panel", SettingsPanelDemo),
      preview("Search Suggestions", SearchSuggestionsDemo),
      preview("Multi-Step Wizard", MultiStepWizardDemo),
    ]),
    accordionSection("Data Display", "8 components", openSection, toggle, [
      preview("Badge", BadgeDemo, "components/data/badge"),
      preview("Tag", TagDemo, "components/data/tag"),
      preview("Data Table", DataTableDemo, "components/data/data-grid"),
      preview("Avatar", AvatarDemo, "components/data/avatar"),
      preview("List View", ListViewDemo, "components/data/list-view"),
      preview(
        "Virtual Scroll",
        VirtualScrollDemo,
        "components/data/virtual-scroll",
      ),
      preview(
        "Digital Clock",
        DigitalClockDemo,
        "components/data/digital-clock",
      ),
      preview("Analog Clock", AnalogClockDemo, "components/data/analog-clock"),
    ]),
    accordionSection("Feedback", "3 components", openSection, toggle, [
      preview("Alert", AlertDemo, "components/feedback/alert"),
      preview(
        "Progress Bar",
        ProgressBarDemo,
        "components/feedback/progress-bar",
      ),
      preview("Spinner", SpinnerDemo, "components/feedback/spinner"),
    ]),
    accordionSection("Navigation", "9 components", openSection, toggle, [
      preview("Tabs", TabsDemo, "components/layout/tabs"),
      preview("Breadcrumb", BreadcrumbDemo, "components/nav/breadcrumb"),
      preview("Pagination", PaginationDemo, "components/nav/pagination"),
      preview("Dropdown Menu", DropdownMenuDemo, "components/nav/dropdown"),
      preview("Menu Bar", MenuBarDemo, "components/nav/menubar"),
      preview("Sidebar", SidebarDemo, "components/nav/sidebar"),
      preview("Stepper", StepperDemo, "components/nav/stepper"),
      preview("Toolbar", ToolbarDemo, "components/nav/toolbar"),
      preview("Tree Nav", TreeNavDemo, "components/nav/treenav"),
    ]),
    accordionSection("Layout", "9 components", openSection, toggle, [
      preview("Card", CardDemo, "components/layout/card"),
      preview("Counter", CounterDemo),
      preview("List with Filter", FilterListDemo),
      preview(
        "Flex Container",
        FlexContainerDemo,
        "components/layout/flex-container",
      ),
      preview("Grid", GridDemo, "components/layout/grid"),
      preview("Panel", PanelDemo, "components/layout/panel"),
      preview(
        "Scroll Container",
        ScrollContainerDemo,
        "components/layout/scroll-container",
      ),
      preview("Splitter", SplitterDemo, "components/layout/splitter"),
      preview("Tabs Layout", TabsLayoutDemo, "components/layout/tabs"),
    ]),
    accordionSection("Charts & Graphs", "12 components", openSection, toggle, [
      preview("Bar Graph", BarGraphDemo, "components/viz/2D-bar-graph"),
      preview("Line Graph", LineGraphDemo, "components/viz/2D-line-graph"),
      preview("Time-Series", TimeSeriesDemo, "components/viz/2D-line-graph"),
      preview("Pie Chart", PieChartDemo, "components/viz/2D-pie-graph"),
      preview("Donut Chart", DonutChartDemo, "components/viz/2D-pie-graph"),
      preview("Histogram", HistogramDemo, "components/viz/histogram"),
      preview("Box Plot", BoxPlotDemo, "components/viz/box-plot"),
      preview(
        "Scatter Plot",
        ScatterPlotDemo,
        "components/viz/2D-cartesian-raw",
      ),
      preview("Bubble Chart", BubbleChartDemo, "components/viz/bubble-chart"),
      preview("Lollipop Chart", LollipopDemo, "components/viz/lollipop"),
      preview("Waterfall Chart", WaterfallDemo, "components/viz/waterfall"),
      preview("Funnel Chart", FunnelDemo, "components/viz/funnel"),
    ]),
    accordionSection("Data & Analytics", "9 components", openSection, toggle, [
      preview("Heat Map", HeatMapDemo, "components/viz/heat-map"),
      preview(
        "Calendar Heat Map",
        CalendarHeatMapDemo,
        "components/viz/calendar-heat-map",
      ),
      preview("Gauge", GaugeDemo, "components/viz/gauge"),
      preview("Radar Chart", RadarDemo, "components/viz/radar-chart"),
      preview("Big Number", BigNumberDemo, "components/viz/big-number"),
      preview("Word Cloud", WordCloudDemo, "components/viz/word-cloud"),
      preview("Pivot Table", PivotTableDemo, "components/viz/pivot-table"),
      preview("Matrix", MatrixDemo, "components/viz/matrix"),
      preview("Gantt Chart", GanttDemo, "components/viz/gantt-chart"),
    ]),
    accordionSection(
      "Hierarchical & Relational",
      "9 components",
      openSection,
      toggle,
      [
        preview("Tree Map", TreeMapDemo, "components/viz/tree-map"),
        preview("Sunburst", SunburstDemo, "components/viz/sunburst"),
        preview("Sankey Diagram", SankeyDemo, "components/viz/sankey"),
        preview("Chord Diagram", ChordDemo, "components/viz/chord"),
        preview(
          "Force-Directed Graph",
          ForceGraphDemo,
          "components/viz/force-graph",
        ),
        preview("Partition Diagram", PartitionDemo, "components/viz/partition"),
        preview(
          "Decomposition Tree",
          DecompositionTreeDemo,
          "components/viz/decomposition-tree",
        ),
        preview("Geospatial Map", GeoMapDemo, "components/viz/geo-map"),
        preview("Vector Field", VectorFieldDemo, "components/viz/vector-field"),
      ],
    ),
    accordionSection("Mathematical", "3 components", openSection, toggle, [
      preview(
        "Cartesian Graph (4-leaf Rose)",
        CartesianRoseDemo,
        "components/viz/2D-cartesian-raw",
      ),
      preview(
        "Complex Plane (Mandelbrot)",
        MandelbrotDemo,
        "components/viz/2D-complex-graph",
      ),
      preview(
        "Polar Graph (3-leaf Rose)",
        PolarRoseDemo,
        "components/viz/2D-polar-graph",
      ),
    ]),
    accordionSection("3D & Advanced", "3 components", openSection, toggle, [
      preview("Hypercube (4D)", HypercubeDemo, "components/viz/graph"),
      preview("3D Layers", ThreeDLayersDemo, "components/viz/3d-layers"),
      preview("Pendulum Physics", DoublePendulumDemo, "components/viz/force-graph"),
    ]),
    createElement(
      FeatureGate,
      { flag: "page-layouts", fallback: null },
      accordionSection("Page Layouts", "4 layouts", openSection, toggle, [
        createElement(PageLayoutSelector, null),
      ]),
    ),
  );
}

function accordionSection(
  title: string,
  subtitle: string,
  openSection: string | null,
  toggle: (name: string) => void,
  children: ReturnType<typeof createElement>[],
) {
  const isOpen = openSection === title;
  return createElement(
    "div",
    { className: "accordion-section" },
    createElement(
      "button",
      {
        className: `accordion-header ${isOpen ? "accordion-header--open" : ""}`,
        onClick: () => toggle(title),
      },
      createElement(
        "div",
        { className: "accordion-header-left" },
        createElement(
          "span",
          { className: "accordion-chevron" },
          isOpen ? "\u25bc" : "\u25b6",
        ),
        createElement("span", { className: "accordion-title" }, title),
        createElement("span", { className: "accordion-subtitle" }, subtitle),
      ),
    ),
    isOpen
      ? createElement(
          "div",
          { className: "accordion-body" },
          createElement("div", { className: "preview-grid" }, ...children),
        )
      : null,
  );
}

// ─── Form ─────────────────────────────────────────────────────────────
function ToggleDemo() {
  const [on, setOn] = useState(false);
  return createElement(Toggle, {
    checked: on,
    onChange: setOn,
    label: on ? "On" : "Off",
  });
}

function TextInputDemo() {
  const [value, setValue] = useState("");
  return createElement(
    "div",
    null,
    createElement(TextField, {
      value,
      onChange: setValue,
      placeholder: "Type something...",
      label: "Text Input",
    }),
    value
      ? createElement(
          "p",
          { style: { fontSize: "13px", color: "#64748b", marginTop: "8px" } },
          `"${value}" (${value.length} chars)`,
        )
      : null,
  );
}

function CheckboxDemo() {
  const [checked, setChecked] = useState(false);
  return createElement(Checkbox, {
    checked,
    onChange: setChecked,
    label: checked ? "Checked" : "Unchecked",
  });
}

function RadioGroupDemo() {
  const [selected, setSelected] = useState("small");
  return createElement(RadioGroup, {
    name: "size-demo",
    label: "Size",
    value: selected,
    onChange: setSelected,
    options: [
      { value: "small", label: "Small" },
      { value: "medium", label: "Medium" },
      { value: "large", label: "Large" },
    ],
  });
}

function SelectDemo() {
  const [value, setValue] = useState("");
  return createElement(Select, {
    value,
    onChange: (v: string | string[]) => setValue(v as string),
    label: "Fruit",
    placeholder: "Select a fruit...",
    options: [
      { value: "apple", label: "Apple" },
      { value: "banana", label: "Banana" },
      { value: "cherry", label: "Cherry" },
      { value: "date", label: "Date" },
    ],
  });
}

function SliderDemo() {
  const [value, setValue] = useState(50);
  return createElement(Slider, {
    value,
    onChange: (v: number | [number, number]) => setValue(v as number),
    min: 0,
    max: 100,
    showValue: true,
    label: "Slider",
  });
}

function NumberSpinnerDemo() {
  const [n, setN] = useState(0);
  return createElement(NumberSpinner, {
    value: n,
    onChange: setN,
    min: -100,
    max: 100,
    label: "Counter",
  });
}

// ─── Data Display ─────────────────────────────────────────────────────
function BadgeDemo() {
  const [count, setCount] = useState(3);
  return createElement(
    "div",
    { style: { display: "flex", alignItems: "center", gap: "16px" } },
    createElement(
      Badge,
      { count, color: "#ef4444" },
      createElement("span", { style: { fontSize: "20px" } }, "\ud83d\udce8"),
    ),
    createElement(
      Button,
      { onClick: () => setCount(count + 1), size: "sm" },
      "+1",
    ),
    createElement(Button, { onClick: () => setCount(0), size: "sm" }, "Clear"),
  );
}

function TagDemo() {
  const [tags, setTags] = useState(["SpecifyJS", "TypeScript", "SPA"]);
  return createElement(
    "div",
    { style: { display: "flex", gap: "6px", flexWrap: "wrap" } },
    ...tags.map((tag) =>
      createElement(Tag, {
        key: tag,
        label: tag,
        color: "#3b82f6",
        variant: "subtle",
        removable: true,
        onRemove: () => setTags(tags.filter((t) => t !== tag)),
      }),
    ),
  );
}

function DataTableDemo() {
  return createElement(DataGrid, {
    columns: [
      { key: "name", header: "Name" },
      { key: "age", header: "Age" },
      { key: "role", header: "Role" },
    ],
    data: [
      { name: "Alice", age: 28, role: "Engineer" },
      { name: "Bob", age: 34, role: "Designer" },
      { name: "Carol", age: 25, role: "Manager" },
    ],
    striped: true,
  });
}

function AvatarDemo() {
  return createElement(
    "div",
    { style: { display: "flex", gap: "8px" } },
    createElement(Avatar, { name: "Sam Caldwell", fallbackColor: "#3b82f6" }),
    createElement(Avatar, {
      name: "Asymmetric Effort",
      fallbackColor: "#10b981",
    }),
    createElement(Avatar, { name: "Lisa Jones", fallbackColor: "#f59e0b" }),
  );
}

// ─── Feedback ─────────────────────────────────────────────────────────
function AlertDemo() {
  const [visible, setVisible] = useState(true);
  if (!visible)
    return createElement(
      Button,
      { onClick: () => setVisible(true) },
      "Show Alert",
    );
  return createElement(Alert, {
    type: "info",
    message: "Informational alert built with SpecifyJS.",
    closable: true,
    onClose: () => setVisible(false),
  });
}

function ProgressBarDemo() {
  const [value, setValue] = useState(60);
  return createElement(
    "div",
    null,
    createElement(ProgressBar, { value, max: 100, showLabel: true }),
    createElement(
      "div",
      { style: { display: "flex", gap: "8px", marginTop: "8px" } },
      createElement(
        Button,
        { onClick: () => setValue(Math.max(0, value - 10)), size: "sm" },
        "-10",
      ),
      createElement(
        "span",
        { style: { fontSize: "13px", color: "#64748b" } },
        `${value}%`,
      ),
      createElement(
        Button,
        { onClick: () => setValue(Math.min(100, value + 10)), size: "sm" },
        "+10",
      ),
    ),
  );
}

function SpinnerDemo() {
  return createElement(
    "div",
    { style: { display: "flex", alignItems: "center", gap: "12px" } },
    createElement(Spinner, { size: "md", label: "Loading..." }),
  );
}

// ─── Navigation ───────────────────────────────────────────────────────
function TabsDemo() {
  const [active, setActive] = useState("overview");
  return createElement(Tabs, {
    activeTab: active,
    onChange: setActive,
    variant: "line",
    tabs: [
      {
        id: "overview",
        label: "Overview",
        content: createElement(
          "div",
          { style: { fontSize: "14px", color: "#64748b", padding: "8px 0" } },
          "Content for Overview tab.",
        ),
      },
      {
        id: "details",
        label: "Details",
        content: createElement(
          "div",
          { style: { fontSize: "14px", color: "#64748b", padding: "8px 0" } },
          "Content for Details tab.",
        ),
      },
      {
        id: "settings",
        label: "Settings",
        content: createElement(
          "div",
          { style: { fontSize: "14px", color: "#64748b", padding: "8px 0" } },
          "Content for Settings tab.",
        ),
      },
    ],
  });
}

function BreadcrumbDemo() {
  return createElement(Breadcrumb, {
    items: [
      { label: "Home", href: "#/" },
      { label: "Products", href: "#/products" },
      { label: "Electronics", href: "#/electronics" },
      { label: "Phones" },
    ],
  });
}

function PaginationDemo() {
  const [page, setPage] = useState(1);
  return createElement(Pagination, {
    total: 50,
    pageSize: 10,
    currentPage: page,
    onChange: setPage,
  });
}

// ─── Layout ───────────────────────────────────────────────────────────
function CardDemo() {
  return createElement(
    Card,
    {
      title: "Card Title",
      subtitle: "A simple card with header and body content.",
      hoverable: true,
      shadow: "md",
    },
    createElement(
      "p",
      { style: { fontSize: "13px", color: "#64748b" } },
      "Card body content goes here. Cards support titles, images, footers, and hover effects.",
    ),
  );
}

function CounterDemo() {
  const [count, setCount] = useState(0);
  return createElement(
    FlexContainer,
    { gap: "12px", alignItems: "center" },
    createElement(
      Button,
      { onClick: () => setCount((c: number) => c - 1), size: "md" },
      "-",
    ),
    createElement(
      "span",
      {
        style: {
          fontSize: "24px",
          fontWeight: "700",
          minWidth: "40px",
          textAlign: "center",
        },
      },
      String(count),
    ),
    createElement(
      Button,
      { onClick: () => setCount((c: number) => c + 1), size: "md" },
      "+",
    ),
  );
}

function FilterListDemo() {
  const items = [
    "Apple",
    "Banana",
    "Cherry",
    "Date",
    "Elderberry",
    "Fig",
    "Grape",
  ];
  const [filter, setFilter] = useState("");
  const filtered = items.filter((i) =>
    i.toLowerCase().includes(filter.toLowerCase()),
  );
  return createElement(
    "div",
    null,
    createElement(TextField, {
      value: filter,
      onChange: setFilter,
      placeholder: "Filter fruits...",
      label: "Filter",
    }),
    createElement(ListView, {
      items: filtered,
      keyExtractor: (item: unknown) => item as string,
      renderItem: (item: unknown) =>
        createElement("span", { style: { fontSize: "14px" } }, item as string),
      divider: true,
      emptyMessage: "No matches",
    }),
  );
}

// ─── Visualization ────────────────────────────────────────────────────
function BarGraphDemo() {
  return createElement(BarGraph, {
    data: [
      { label: "Q1", value: 42, color: "#3b82f6" },
      { label: "Q2", value: 67, color: "#10b981" },
      { label: "Q3", value: 35, color: "#f59e0b" },
      { label: "Q4", value: 89, color: "#ef4444" },
    ],
    width: 240,
    height: 140,
    showValues: true,
    showGrid: true,
    title: "Quarterly Revenue",
  });
}

function LineGraphDemo() {
  return createElement(LineGraph, {
    data: [
      { x: 0, y: 20 },
      { x: 1, y: 45 },
      { x: 2, y: 30 },
      { x: 3, y: 65 },
      { x: 4, y: 50 },
      { x: 5, y: 80 },
      { x: 6, y: 55 },
    ],
    width: 240,
    height: 120,
    showPoints: true,
    showGrid: true,
    lineColor: "#3b82f6",
    title: "Weekly Trend",
  });
}

function PieChartDemo() {
  return createElement(PieGraph, {
    data: [
      { label: "TypeScript", value: 60, color: "#3b82f6" },
      { label: "Go", value: 25, color: "#10b981" },
      { label: "Other", value: 15, color: "#f59e0b" },
    ],
    width: 280,
    height: 160,
    showLabels: true,
    showValues: true,
    showLegend: true,
    legendPosition: "right",
  });
}

function ForceGraphDemo() {
  return createElement(ForceGraph, {
    nodes: [
      { id: "A", color: "#3b82f6" },
      { id: "B", color: "#10b981" },
      { id: "C", color: "#f59e0b" },
      { id: "D", color: "#ef4444" },
      { id: "E", color: "#8b5cf6" },
    ],
    edges: [
      { source: "A", target: "B" },
      { source: "B", target: "C" },
      { source: "C", target: "D" },
      { source: "D", target: "E" },
      { source: "E", target: "A" },
      { source: "A", target: "C" },
      { source: "B", target: "D" },
    ],
    width: 240,
    height: 160,
    showLabels: true,
  });
}

function HypercubeDemo() {
  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-theme") === "dark";
  return createElement(HypercubeGraph, {
    dimension: 4,
    width: 240,
    height: 160,
    vertexColors: "auto",
    edgeColor: isDark ? "#cbd5e1" : "#1e293b",
    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
    showLabels: false,
  });
}

function ScatterPlotDemo() {
  return createElement(CartesianGraph2D, {
    width: 240,
    height: 120,
    points: [
      { x: 20, y: 80 },
      { x: 45, y: 55 },
      { x: 70, y: 90 },
      { x: 90, y: 30 },
      { x: 120, y: 65 },
      { x: 150, y: 20 },
      { x: 170, y: 50 },
      { x: 200, y: 35 },
      { x: 60, y: 40 },
      { x: 130, y: 75 },
      { x: 180, y: 85 },
      { x: 100, y: 100 },
    ],
    showGrid: true,
    showAxes: true,
    pointRadius: 4,
    pointColor: "#3b82f6",
  });
}

// ─── Form (additional) ──────────────────────────────────────────────

function ColorPickerDemo() {
  const [color, setColor] = useState("#3b82f6");
  return createElement(ColorPicker, {
    value: color,
    onChange: setColor,
    label: "Pick a color",
  });
}

function DatePickerDemo() {
  const [value, setValue] = useState("2026-04-28");
  return createElement(DatePicker, {
    value,
    onChange: setValue,
    label: "Select date",
  });
}

function TimePickerDemo() {
  const [time12, setTime12] = useState("09:30");
  const [time24, setTime24] = useState("14:30");
  const [timeTz, setTimeTz] = useState("10:15:00");
  const [tz, setTz] = useState("America/New_York");
  return createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: "16px" } },
    createElement(TimePicker, {
      value: time12,
      onChange: setTime12,
      format: "12h",
      label: "12-hour (AM/PM)",
    }),
    createElement(TimePicker, {
      value: time24,
      onChange: setTime24,
      format: "24h",
      label: "24-hour clock",
    }),
    createElement(TimePicker, {
      value: timeTz,
      onChange: setTimeTz,
      format: "24h",
      showSeconds: true,
      showTimezone: true,
      timezone: tz,
      onTimezoneChange: setTz,
      label: "With seconds + timezone",
    }),
  );
}

function FileUploadDemo() {
  return createElement(FileUpload, {
    onChange: () => {},
    multiple: true,
    label: "Upload Files",
    helpText: "Drag and drop or click to select",
  });
}

function MultilineDemo() {
  const [text, setText] = useState("");
  return createElement(MultilineField, {
    value: text,
    onChange: setText,
    placeholder: "Type your message...",
    maxLength: 200,
    showCount: true,
    label: "Message",
    rows: 4,
  });
}

function TextEditorDemo() {
  return createElement(TextEditor, {
    value:
      "Select <b>text</b> and format with the toolbar. Try <i>italic</i>, <u>underline</u>, and <s>strikethrough</s>.",
    label: "Rich Text Editor",
    minHeight: "120px",
  });
}

// ─── Navigation (additional) ────────────────────────────────────────

function DropdownMenuDemo() {
  return createElement(Dropdown, {
    label: "Menu",
    items: [
      { id: "profile", label: "Profile", onClick: () => {} },
      { id: "settings", label: "Settings", onClick: () => {} },
      { id: "help", label: "Help", onClick: () => {} },
      { id: "logout", label: "Log out", onClick: () => {} },
    ],
  });
}

function MenuBarDemo() {
  return createElement(Menubar, {
    menus: [
      {
        label: "File",
        items: [
          { id: "new", label: "New" },
          { id: "open", label: "Open" },
          { id: "save", label: "Save" },
          { id: "export", label: "Export" },
        ],
      },
      {
        label: "Edit",
        items: [
          { id: "undo", label: "Undo" },
          { id: "redo", label: "Redo" },
          { id: "cut", label: "Cut" },
          { id: "copy", label: "Copy" },
          { id: "paste", label: "Paste" },
        ],
      },
      {
        label: "View",
        items: [
          { id: "zoomin", label: "Zoom In" },
          { id: "zoomout", label: "Zoom Out" },
          { id: "fullscreen", label: "Full Screen" },
        ],
      },
      {
        label: "Help",
        items: [
          { id: "docs", label: "Documentation" },
          { id: "about", label: "About" },
        ],
      },
    ],
  });
}

function SidebarDemo() {
  const [active, setActive] = useState("dashboard");
  return createElement(Sidebar, {
    selectedId: active,
    onSelect: setActive,
    items: [
      { id: "dashboard", label: "Dashboard" },
      { id: "projects", label: "Projects" },
      { id: "messages", label: "Messages" },
      { id: "settings", label: "Settings" },
    ],
  });
}

function StepperDemo() {
  const [current, setCurrent] = useState(0);
  return createElement(
    "div",
    null,
    createElement(Stepper, {
      currentStep: current,
      clickable: true,
      onChange: setCurrent,
      steps: [
        { label: "Details" },
        { label: "Address" },
        { label: "Payment" },
        { label: "Confirm" },
      ],
    }),
    createElement(
      FlexContainer,
      { gap: "8px", style: { marginTop: "12px" } },
      createElement(
        Button,
        {
          onClick: () => setCurrent(Math.max(0, current - 1)),
          disabled: current === 0,
        },
        "Back",
      ),
      createElement(
        Button,
        {
          onClick: () => setCurrent(Math.min(3, current + 1)),
          disabled: current === 3,
          variant: "primary",
        },
        "Next",
      ),
    ),
  );
}

function ToolbarDemo() {
  return createElement(Toolbar, {
    items: [
      { id: "home", icon: "\u2302", tooltip: "Home", type: "button" },
      { id: "search", icon: "\ud83d\udd0d", tooltip: "Search", type: "button" },
      { id: "save", icon: "\ud83d\udcbe", tooltip: "Save", type: "button" },
      { id: "sep1", type: "separator" },
      { id: "undo", icon: "\u21a9", tooltip: "Undo", type: "button" },
      { id: "redo", icon: "\u21aa", tooltip: "Redo", type: "button" },
      { id: "copy", icon: "\ud83d\udccb", tooltip: "Copy", type: "button" },
      { id: "sep2", type: "separator" },
      { id: "delete", icon: "\ud83d\uddd1", tooltip: "Delete", type: "button" },
      { id: "settings", icon: "\u2699", tooltip: "Settings", type: "toggle" },
    ],
  });
}

function TreeNavDemo() {
  const [selected, setSelected] = useState<string | undefined>();
  return createElement(
    "div",
    null,
    createElement(TreeNav, {
      selectedId: selected,
      onNodeClick: (node: { id: string }) => setSelected(node.id),
      root: {
        id: "root",
        label: "Project",
        children: [
          {
            id: "src",
            label: "src",
            children: [
              {
                id: "components",
                label: "components",
                children: [
                  { id: "button", label: "Button.ts" },
                  { id: "input", label: "Input.ts" },
                ],
              },
              {
                id: "hooks",
                label: "hooks",
                children: [
                  { id: "useState", label: "useState.ts" },
                  { id: "useEffect", label: "useEffect.ts" },
                ],
              },
              { id: "index", label: "index.ts" },
            ],
          },
          {
            id: "tests",
            label: "tests",
            children: [
              {
                id: "unit",
                label: "unit",
                children: [{ id: "test1", label: "Button.test.ts" }],
              },
            ],
          },
        ],
      },
    }),
    selected
      ? createElement(
          "p",
          { style: { fontSize: "11px", color: "#3b82f6", marginTop: "6px" } },
          `Selected: ${selected}`,
        )
      : null,
  );
}

// ─── Data Display (additional) ────────────────────────────────────────
function ListViewDemo() {
  const items = [
    "Design System",
    "Component Library",
    "API Reference",
    "Testing Guide",
    "Deployment",
  ];
  const [selected, setSelected] = useState(0);
  return createElement(ListView, {
    items,
    selectedIndex: selected,
    onSelect: setSelected,
    hoverable: true,
    divider: true,
    keyExtractor: (_: unknown, i: number) => String(i),
    renderItem: (item: unknown) =>
      createElement("span", { style: { fontSize: "14px" } }, item as string),
  });
}

function VirtualScrollDemo() {
  const items = Array.from({ length: 1000 }, (_, i) => `Row ${i + 1} of 1000`);
  return createElement(
    "div",
    null,
    createElement(VirtualScroll, {
      items,
      itemHeight: 28,
      height: "120px",
      renderItem: (item: unknown) =>
        createElement(
          "div",
          {
            style: {
              padding: "4px 12px",
              fontSize: "13px",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              height: "28px",
            },
          },
          item as string,
        ),
    }),
    createElement(
      "p",
      { style: { fontSize: "11px", color: "#94a3b8", marginTop: "4px" } },
      "Rendering only visible items of 1000 total",
    ),
  );
}

// ─── Clock Components ─────────────────────────────────────────────────

function DigitalClockDemo() {
  const [format, setFormat] = useState<"12h" | "24h">("12h");
  const [showDate, setShowDate] = useState(true);
  const [dateFormat, setDateFormat] = useState<"short" | "long" | "iso">(
    "short",
  );

  const btnStyle = (active: boolean) => ({
    padding: "3px 10px",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "11px",
    background: active ? "#3b82f6" : "#f8fafc",
    color: active ? "white" : "#0f172a",
  });
  return createElement(
    "div",
    null,
    createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: "6px",
          marginBottom: "10px",
          flexWrap: "wrap",
        },
      },
      createElement(
        Button,
        {
          onClick: () => setFormat("12h"),
          size: "sm",
          active: format === "12h",
        },
        "12h",
      ),
      createElement(
        Button,
        {
          onClick: () => setFormat("24h"),
          size: "sm",
          active: format === "24h",
        },
        "24h",
      ),
      createElement(
        Button,
        { onClick: () => setShowDate(!showDate), size: "sm", active: showDate },
        "Date",
      ),
      createElement(
        Button,
        {
          onClick: () => setDateFormat("short"),
          size: "sm",
          active: dateFormat === "short",
        },
        "Short",
      ),
      createElement(
        Button,
        {
          onClick: () => setDateFormat("long"),
          size: "sm",
          active: dateFormat === "long",
        },
        "Long",
      ),
      createElement(
        Button,
        {
          onClick: () => setDateFormat("iso"),
          size: "sm",
          active: dateFormat === "iso",
        },
        "ISO",
      ),
    ),
    createElement(DigitalClock, { format, showDate, dateFormat }),
  );
}

function AnalogClockDemo() {
  const [format, setFormat] = useState<"12h" | "24h">("12h");
  const [showDate, setShowDate] = useState(false);
  const [showSeconds, setShowSeconds] = useState(true);

  return createElement(
    "div",
    null,
    createElement(
      FlexContainer,
      { gap: "6px", style: { marginBottom: "10px", flexWrap: "wrap" } },
      createElement(
        Button,
        {
          onClick: () => setFormat("12h"),
          size: "sm",
          active: format === "12h",
        },
        "12h",
      ),
      createElement(
        Button,
        {
          onClick: () => setFormat("24h"),
          size: "sm",
          active: format === "24h",
        },
        "24h",
      ),
      createElement(
        Button,
        {
          onClick: () => setShowSeconds(!showSeconds),
          size: "sm",
          active: showSeconds,
        },
        "Seconds",
      ),
      createElement(
        Button,
        { onClick: () => setShowDate(!showDate), size: "sm", active: showDate },
        "Date",
      ),
    ),
    createElement(AnalogClock, { format, size: 180, showDate, showSeconds }),
  );
}

// ─── Layout (additional) ──────────────────────────────────────────────
function FlexContainerDemo() {
  const [direction, setDirection] = useState<"row" | "column">("row");
  const box = (color: string, label: string) =>
    createElement(
      "div",
      {
        key: label,
        style: {
          width: "50px",
          height: "40px",
          backgroundColor: color,
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "11px",
          fontWeight: "600",
        },
      },
      label,
    );
  return createElement(
    "div",
    null,
    createElement(
      "div",
      { style: { display: "flex", gap: "6px", marginBottom: "8px" } },
      createElement(
        Button,
        {
          onClick: () => setDirection("row"),
          size: "sm",
          active: direction === "row",
        },
        "Row",
      ),
      createElement(
        Button,
        {
          onClick: () => setDirection("column"),
          size: "sm",
          active: direction === "column",
        },
        "Column",
      ),
    ),
    createElement(
      FlexContainer,
      {
        direction,
        gap: "8px",
        style: {
          padding: "12px",
          background: "#f8fafc",
          borderRadius: "6px",
          border: "1px solid #e2e8f0",
        },
      },
      box("#3b82f6", "A"),
      box("#10b981", "B"),
      box("#f59e0b", "C"),
    ),
  );
}

function GridDemo() {
  return createElement(
    Grid,
    { columns: 3, gap: "8px" },
    ...Array.from({ length: 6 }, (_, i) =>
      createElement(
        "div",
        {
          key: String(i),
          style: {
            padding: "16px",
            textAlign: "center",
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "600",
            color: "#64748b",
          },
        },
        `Cell ${i + 1}`,
      ),
    ),
  );
}

function PanelDemo() {
  return createElement(
    Panel,
    { title: "Panel Header", collapsible: true, bordered: true },
    createElement(
      "div",
      { style: { fontSize: "13px", color: "#64748b" } },
      "Panel content area. Click the header to collapse.",
    ),
  );
}

function ScrollContainerDemo() {
  return createElement(
    ScrollContainer,
    { maxHeight: "100px", direction: "vertical" },
    ...Array.from({ length: 12 }, (_, i) =>
      createElement(
        "div",
        {
          key: String(i),
          style: { padding: "4px 12px", fontSize: "13px", lineHeight: "1.8" },
        },
        `Scrollable item ${i + 1}`,
      ),
    ),
  );
}

function SplitterDemo() {
  return createElement(
    Splitter,
    {
      direction: "horizontal",
      initialSplit: 50,
      style: {
        height: "80px",
        border: "1px solid #e2e8f0",
        borderRadius: "6px",
        overflow: "hidden",
      },
    },
    createElement(
      "div",
      {
        style: {
          background: "#eff6ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          color: "#3b82f6",
          fontWeight: "600",
          height: "100%",
        },
      },
      "Left",
    ),
    createElement(
      "div",
      {
        style: {
          background: "#f0fdf4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          color: "#16a34a",
          fontWeight: "600",
          height: "100%",
        },
      },
      "Right",
    ),
  );
}

function TabsLayoutDemo() {
  const [active, setActive] = useState("content");
  return createElement(Tabs, {
    activeTab: active,
    onChange: setActive,
    variant: "card",
    tabs: [
      {
        id: "content",
        label: "Content",
        content: createElement(
          "div",
          { style: { padding: "14px", fontSize: "13px", color: "#64748b" } },
          "Layout region: Content",
        ),
      },
      {
        id: "sidebar",
        label: "Sidebar",
        content: createElement(
          "div",
          { style: { padding: "14px", fontSize: "13px", color: "#64748b" } },
          "Layout region: Sidebar",
        ),
      },
      {
        id: "footer",
        label: "Footer",
        content: createElement(
          "div",
          { style: { padding: "14px", fontSize: "13px", color: "#64748b" } },
          "Layout region: Footer",
        ),
      },
    ],
  });
}

// ─── New Graph Components ─────────────────────────────────────────────

function CartesianRoseDemo() {
  // 4-leaf rose: r = cos(2θ) in Cartesian coords
  const samples = 300;
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * 2 * Math.PI;
    const r = Math.cos(2 * t);
    points.push({ x: r * Math.cos(t), y: r * Math.sin(t) });
  }
  return createElement(
    "div",
    null,
    createElement(CartesianGraph2D, {
      width: 220,
      height: 180,
      points,
      xRange: [-1.2, 1.2],
      yRange: [-1.2, 1.2],
      showGrid: true,
      showAxes: true,
      pointRadius: 2,
      pointColor: "#3b82f6",
      curveColor: "#3b82f6",
    }),
    createElement(
      "p",
      { style: { fontSize: "11px", color: "#94a3b8", marginTop: "4px" } },
      "r = cos(2\u03b8) — hover for coords, click/dblclick/right-click supported",
    ),
  );
}

// Precompute Mandelbrot data at module level (static, computed once)
// Precompute at 256x192 resolution — renders as SVG rects, scales cleanly via viewBox
const MANDELBROT_DATA = computeMandelbrotGrid(
  256,
  192,
  [-2.5, 1],
  [-1.2, 1.2],
  100,
);

function MandelbrotDemo() {
  return createElement(
    "div",
    { style: { width: "100%" } },
    createElement(ComplexGraph2D, {
      width: 256,
      height: 192,
      data: MANDELBROT_DATA,
      maxIterations: 100,
      colorScheme: "classic",
    }),
    createElement(
      "p",
      { style: { fontSize: "11px", color: "#94a3b8", marginTop: "4px" } },
      "Mandelbrot set — 256x192 precomputed, scales on maximize",
    ),
  );
}

// Module-level function reference to avoid unstable useEffect deps
const polarRoseFn = (theta: number) => Math.cos(3 * theta);

function PolarRoseDemo() {
  return createElement(
    "div",
    null,
    createElement(PolarGraph2D, {
      width: 220,
      height: 200,
      plotFunction: polarRoseFn,
      plotResolution: 270,
      showGrid: true,
      sync: true,
      curveColor: "#8b5cf6",
      pointColor: "#8b5cf6",
    }),
    createElement(
      "p",
      { style: { fontSize: "11px", color: "#94a3b8", marginTop: "4px" } },
      "r = cos(3\u03b8) — hover for coords, click/dblclick/right-click supported",
    ),
  );
}

// ─── Interactive Forms helpers ─────────────────────────────────────────

function formField(
  label: string,
  value: string,
  onChange: (v: string) => void,
  error: string | undefined,
  type: string,
  placeholder: string,
) {
  return createElement(TextField, {
    label,
    value,
    onChange,
    error,
    type: type as "text",
    placeholder,
  });
}

function formToggleRow(label: string, on: boolean, onClick: () => void) {
  return createElement(Toggle, {
    checked: on,
    onChange: () => onClick(),
    label,
  });
}

function SignUpFormDemo() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.includes("@")) e.email = "Valid email required";
    return e;
  }, [name, email]);

  const handleSubmit = useCallback(() => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length === 0) setSubmitted(true);
  }, [validate]);

  if (submitted) {
    return createElement(
      "div",
      { style: { textAlign: "center", padding: "20px" } },
      createElement(
        "div",
        { style: { fontSize: "24px", marginBottom: "8px" } },
        "\u2705",
      ),
      createElement("p", { style: { fontWeight: "600" } }, `Welcome, ${name}!`),
      createElement(
        Button,
        {
          onClick: () => {
            setSubmitted(false);
            setName("");
            setEmail("");
          },
        },
        "Reset",
      ),
    );
  }

  return createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: "12px" } },
    formField(
      "Name",
      name,
      (v: string) => setName(v),
      errors.name,
      "text",
      "Your name",
    ),
    formField(
      "Email",
      email,
      (v: string) => setEmail(v),
      errors.email,
      "email",
      "you@example.com",
    ),
    createElement(
      Button,
      { onClick: handleSubmit, variant: "primary" },
      "Sign Up",
    ),
  );
}

function SettingsPanelDemo() {
  const [dark, setDark] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [fontSize, setFontSize] = useState(14);

  return createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: "14px" } },
    formToggleRow("Dark Mode", dark, () => setDark(!dark)),
    formToggleRow("Notifications", notifications, () =>
      setNotifications(!notifications),
    ),
    createElement(Slider, {
      value: fontSize,
      onChange: (v: number | [number, number]) => setFontSize(v as number),
      min: 10,
      max: 24,
      showValue: true,
      label: `Font Size: ${fontSize}px`,
    }),
    createElement(
      "div",
      {
        style: {
          padding: "12px",
          borderRadius: "6px",
          fontSize: `${fontSize}px`,
          background: dark ? "#1e293b" : "#f8fafc",
          color: dark ? "#e2e8f0" : "#0f172a",
          border: "1px solid #e2e8f0",
        },
      },
      `Preview text at ${fontSize}px`,
    ),
  );
}

function SearchSuggestionsDemo() {
  const items = [
    "React",
    "SpecifyJS",
    "Vue",
    "Angular",
    "Svelte",
    "Solid",
    "Preact",
    "Lit",
    "Qwik",
    "Astro",
  ];
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");

  const matches =
    query.length > 0
      ? items.filter((i) => i.toLowerCase().includes(query.toLowerCase()))
      : [];

  return createElement(
    "div",
    null,
    createElement(TextField, {
      value: query,
      onChange: (v: string) => {
        setQuery(v);
        setSelected("");
      },
      placeholder: "Search frameworks...",
      label: "Search",
    }),
    matches.length > 0 && !selected
      ? createElement(ListView, {
          items: matches,
          keyExtractor: (item: unknown) => item as string,
          renderItem: (item: unknown) =>
            createElement(
              "span",
              { style: { fontSize: "13px" } },
              item as string,
            ),
          onSelect: (idx: number) => {
            setSelected(matches[idx]!);
            setQuery(matches[idx]!);
          },
          hoverable: true,
          divider: true,
        })
      : null,
    selected
      ? createElement(
          "p",
          { style: { fontSize: "13px", color: "#16a34a", marginTop: "8px" } },
          `Selected: ${selected}`,
        )
      : null,
  );
}

function MultiStepWizardDemo() {
  const [step, setStep] = useState(0);

  return createElement(
    "div",
    null,
    createElement(Stepper, {
      currentStep: step,
      steps: [{ label: "Account" }, { label: "Profile" }, { label: "Confirm" }],
      clickable: true,
      onChange: setStep,
    }),
    createElement(
      "div",
      {
        style: {
          textAlign: "center",
          padding: "16px 0",
          fontSize: "14px",
          color: "#64748b",
        },
      },
      `Step ${step + 1} content area`,
    ),
    createElement(
      FlexContainer,
      { gap: "8px", justifyContent: "center" },
      step > 0
        ? createElement(Button, { onClick: () => setStep(step - 1) }, "Back")
        : null,
      step < 2
        ? createElement(
            Button,
            { onClick: () => setStep(step + 1), variant: "primary" },
            "Next",
          )
        : createElement(
            Button,
            {
              onClick: () => setStep(0),
              style: {
                backgroundColor: "#16a34a",
                color: "white",
                border: "none",
              },
            },
            "Finish",
          ),
    ),
  );
}

// ─── Visualization Demos ────────────────────────────────────────────

function TimeSeriesDemo() {
  const values = [32, 45, 38, 62, 55, 78, 85, 72, 90, 68, 54, 42];
  return createElement(LineGraph, {
    data: values.map((y, i) => ({ x: i, y })),
    width: 280,
    height: 140,
    showPoints: true,
    showGrid: true,
    showArea: true,
    lineColor: "#3b82f6",
    areaColor: "rgba(59,130,246,0.1)",
    xLabel: "Month",
    yLabel: "Value",
    title: "Monthly Trend",
  });
}

function DonutChartDemo() {
  return createElement(PieGraph, {
    data: [
      { label: "Desktop", value: 45, color: "#3b82f6" },
      { label: "Mobile", value: 30, color: "#10b981" },
      { label: "Tablet", value: 15, color: "#f59e0b" },
      { label: "Other", value: 10, color: "#8b5cf6" },
    ],
    width: 280,
    height: 160,
    innerRadius: 30,
    centerLabel: "Traffic",
    showLabels: true,
    showValues: true,
    showLegend: true,
    legendPosition: "right",
  });
}

function HistogramDemo() {
  return createElement(Histogram, {
    data: [
      12, 15, 22, 28, 35, 42, 45, 50, 55, 58, 62, 65, 68, 72, 75, 78, 80, 82,
      85, 88, 90, 92, 38, 48, 52, 55, 60, 63, 67, 70,
    ],
    bins: 10,
    width: 260,
    height: 140,
    barColor: "#3b82f6",
    showGrid: true,
    showValues: true,
    title: "Score Distribution",
  });
}

function BoxPlotDemo() {
  return createElement(BoxPlot, {
    data: [
      {
        label: "Q1",
        values: [35, 42, 48, 52, 55, 58, 62, 65, 68, 72, 78, 85, 120],
      },
      { label: "Q2", values: [40, 45, 50, 55, 60, 65, 68, 70, 72, 75, 80, 88] },
      { label: "Q3", values: [30, 38, 42, 48, 52, 55, 58, 60, 62, 65, 70] },
    ],
    width: 260,
    height: 140,
    showOutliers: true,
    showMean: true,
    showGrid: true,
  });
}

function BubbleChartDemo() {
  return createElement(BubbleChart, {
    data: [
      { x: 20, y: 80, r: 15, label: "A", color: "#3b82f6" },
      { x: 50, y: 55, r: 25, label: "B", color: "#10b981" },
      { x: 80, y: 90, r: 10, label: "C", color: "#f59e0b" },
      { x: 110, y: 30, r: 35, label: "D", color: "#ef4444" },
      { x: 150, y: 60, r: 20, label: "E", color: "#8b5cf6" },
      { x: 180, y: 45, r: 18, label: "F", color: "#ec4899" },
    ],
    width: 240,
    height: 140,
    showGrid: true,
    showAxes: true,
    showLabels: true,
  });
}

function LollipopDemo() {
  return createElement(LollipopChart, {
    data: [
      { label: "React", value: 85, color: "#3b82f6" },
      { label: "Vue", value: 62, color: "#10b981" },
      { label: "Angular", value: 45, color: "#f59e0b" },
      { label: "Svelte", value: 38, color: "#ef4444" },
      { label: "Solid", value: 28, color: "#8b5cf6" },
    ],
    width: 260,
    height: 140,
    orientation: "horizontal",
    showValues: true,
    showGrid: true,
  });
}

function WaterfallDemo() {
  return createElement(WaterfallChart, {
    data: [
      { label: "Revenue", value: 420, type: "increase" },
      { label: "COGS", value: -180, type: "decrease" },
      { label: "Gross", value: 240, type: "total" },
      { label: "OpEx", value: -90, type: "decrease" },
      { label: "Tax", value: -30, type: "decrease" },
      { label: "Net", value: 120, type: "total" },
    ],
    width: 280,
    height: 160,
    showValues: true,
    showConnectors: true,
    showGrid: true,
  });
}

function FunnelDemo() {
  return createElement(FunnelChart, {
    data: [
      { label: "Visitors", value: 10000, color: "#3b82f6" },
      { label: "Signups", value: 5200, color: "#6366f1" },
      { label: "Active", value: 3100, color: "#8b5cf6" },
      { label: "Paid", value: 1400, color: "#a855f7" },
      { label: "Retained", value: 800, color: "#c084fc" },
    ],
    width: 260,
    height: 180,
    showLabels: true,
    showValues: true,
    showPercentage: true,
  });
}

function BigNumberDemo() {
  return createElement(BigNumber, {
    value: 42850,
    label: "Monthly Revenue",
    prefix: "$",
    trend: 12.5,
    trendLabel: "vs last month",
    sparkline: [32, 45, 38, 62, 55, 78, 85, 72, 90, 68, 54, 42],
    width: 260,
    height: 140,
  });
}

function GaugeDemo() {
  return createElement(Gauge, {
    value: 72,
    min: 0,
    max: 100,
    width: 220,
    height: 140,
    showValue: true,
    showMinMax: true,
    showTicks: true,
    tickCount: 5,
    label: "Performance",
    unit: "%",
    colors: ["#ef4444", "#f59e0b", "#10b981"],
  });
}

function RadarDemo() {
  return createElement(RadarChart, {
    axes: [
      { label: "Speed" },
      { label: "Power" },
      { label: "Range" },
      { label: "Defense" },
      { label: "Accuracy" },
      { label: "Agility" },
    ],
    series: [
      { label: "Player A", values: [80, 65, 90, 50, 75, 85], color: "#3b82f6" },
      { label: "Player B", values: [60, 85, 55, 80, 70, 45], color: "#ef4444" },
    ],
    width: 240,
    height: 200,
    showLabels: true,
    showDots: true,
    showLegend: true,
  });
}

function WordCloudDemo() {
  return createElement(WordCloud, {
    words: [
      { text: "Led Zeppelin", weight: 100 },
      { text: "Stairway to Heaven", weight: 90 },
      { text: "Kashmir", weight: 85 },
      { text: "Black Dog", weight: 75 },
      { text: "Rock and Roll", weight: 72 },
      { text: "Whole Lotta Love", weight: 70 },
      { text: "Immigrant Song", weight: 65 },
      { text: "Dazed and Confused", weight: 60 },
      { text: "Communication Breakdown", weight: 55 },
      { text: "Ramble On", weight: 50 },
      { text: "Going to California", weight: 45 },
      { text: "The Ocean", weight: 42 },
      { text: "Misty Mountain Hop", weight: 38 },
      { text: "Houses of the Holy", weight: 35 },
      { text: "When the Levee Breaks", weight: 32 },
      { text: "Good Times Bad Times", weight: 28 },
      { text: "Heartbreaker", weight: 25 },
      { text: "No Quarter", weight: 22 },
      { text: "Since I Been Loving You", weight: 20 },
      { text: "Tangerine", weight: 18 },
    ],
    width: 400,
    height: 250,
    minFontSize: 10,
    maxFontSize: 40,
    colors: ["#dc2626", "#f59e0b", "#1d4ed8", "#7c3aed", "#059669", "#db2777"],
  });
}

function HeatMapDemo() {
  return createElement(HeatMap, {
    data: [
      [5, 3, 8, 2, 6],
      [7, 1, 4, 9, 3],
      [2, 8, 6, 1, 7],
      [4, 5, 3, 8, 2],
    ],
    rowLabels: ["Mon", "Tue", "Wed", "Thu"],
    columnLabels: ["9am", "11am", "1pm", "3pm", "5pm"],
    width: 280,
    height: 160,
    showValues: true,
    title: "Activity",
  });
}

function CalendarHeatMapDemo() {
  const data: { date: string; value: number }[] = [];
  const base = new Date("2026-01-01");
  for (let d = 0; d < 120; d++) {
    const dt = new Date(base);
    dt.setDate(dt.getDate() + d);
    const iso = dt.toISOString().slice(0, 10);
    data.push({ date: iso, value: Math.floor(Math.random() * 10) });
  }
  return createElement(CalendarHeatMap, {
    data,
    width: 280,
    height: 120,
    showMonthLabels: true,
    showDayLabels: true,
  });
}

function PivotTableDemo() {
  return createElement(PivotTable, {
    data: [
      { region: "North", product: "Widget", sales: 120 },
      { region: "North", product: "Gadget", sales: 85 },
      { region: "South", product: "Widget", sales: 95 },
      { region: "South", product: "Gadget", sales: 110 },
      { region: "East", product: "Widget", sales: 140 },
      { region: "East", product: "Gadget", sales: 75 },
    ],
    rows: ["region"],
    columns: ["product"],
    values: ["sales"],
    aggregation: "sum",
    showTotals: true,
    width: 300,
    height: 200,
  });
}

function MatrixDemo() {
  return createElement(Matrix, {
    data: [
      [1.0, 0.8, 0.3, -0.2],
      [0.8, 1.0, 0.5, 0.1],
      [0.3, 0.5, 1.0, 0.7],
      [-0.2, 0.1, 0.7, 1.0],
    ],
    labels: ["A", "B", "C", "D"],
    width: 220,
    height: 220,
    showValues: true,
    symmetric: true,
    title: "Correlation",
  });
}

function GanttDemo() {
  return createElement(GanttChart, {
    tasks: [
      { id: "1", label: "Research", start: 0, duration: 3, color: "#3b82f6" },
      { id: "2", label: "Design", start: 2, duration: 4, color: "#10b981" },
      { id: "3", label: "Develop", start: 5, duration: 6, color: "#f59e0b" },
      { id: "4", label: "Test", start: 9, duration: 3, color: "#ef4444" },
      { id: "5", label: "Deploy", start: 11, duration: 2, color: "#8b5cf6" },
    ],
    width: 300,
    height: 160,
    showGrid: true,
    showLabels: true,
    timeUnit: "weeks",
  });
}

function TreeMapDemo() {
  return createElement(TreeMap, {
    data: {
      label: "Portfolio",
      value: 0,
      children: [
        { label: "Tech", value: 45, color: "#3b82f6" },
        { label: "Health", value: 25, color: "#10b981" },
        { label: "Finance", value: 18, color: "#f59e0b" },
        { label: "Energy", value: 12, color: "#ef4444" },
      ],
    },
    width: 280,
    height: 160,
    showLabels: true,
    showValues: true,
  });
}

function SunburstDemo() {
  return createElement(Sunburst, {
    data: {
      label: "Total",
      children: [
        {
          label: "A",
          value: 40,
          children: [
            { label: "A1", value: 25 },
            { label: "A2", value: 15 },
          ],
        },
        {
          label: "B",
          value: 35,
          children: [
            { label: "B1", value: 20 },
            { label: "B2", value: 15 },
          ],
        },
        { label: "C", value: 25 },
      ],
    },
    width: 240,
    height: 240,
    showLabels: true,
    colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"],
  });
}

function SankeyDemo() {
  return createElement(SankeyDiagram, {
    nodes: [
      { id: "a", label: "Source A" },
      { id: "b", label: "Source B" },
      { id: "c", label: "Process" },
      { id: "d", label: "Output X" },
      { id: "e", label: "Output Y" },
    ],
    links: [
      { source: "a", target: "c", value: 30 },
      { source: "b", target: "c", value: 20 },
      { source: "c", target: "d", value: 35 },
      { source: "c", target: "e", value: 15 },
    ],
    width: 300,
    height: 180,
    showLabels: true,
    showValues: true,
  });
}

function ChordDemo() {
  return createElement(ChordDiagram, {
    matrix: [
      [0, 20, 10, 5],
      [15, 0, 25, 8],
      [8, 12, 0, 18],
      [5, 10, 15, 0],
    ],
    labels: ["Web", "Mobile", "API", "DB"],
    width: 240,
    height: 240,
    showLabels: true,
    colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
  });
}

function PartitionDemo() {
  return createElement(Partition, {
    data: {
      label: "Root",
      children: [
        {
          label: "A",
          value: 40,
          children: [
            { label: "A1", value: 25 },
            { label: "A2", value: 15 },
          ],
        },
        {
          label: "B",
          value: 35,
          children: [
            { label: "B1", value: 20 },
            { label: "B2", value: 15 },
          ],
        },
        { label: "C", value: 25 },
      ],
    },
    width: 300,
    height: 160,
    showLabels: true,
    showValues: true,
    colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
  });
}

function DecompositionTreeDemo() {
  return createElement(DecompositionTree, {
    data: {
      label: "Revenue",
      value: "$10M",
      children: [
        {
          label: "Product",
          value: "$6M",
          children: [
            { label: "SaaS", value: "$4M" },
            { label: "License", value: "$2M" },
          ],
        },
        {
          label: "Services",
          value: "$4M",
          children: [
            { label: "Consulting", value: "$2.5M" },
            { label: "Support", value: "$1.5M" },
          ],
        },
      ],
    },
    width: 320,
    height: 180,
    orientation: "horizontal",
    showValues: true,
    showConnectors: true,
  });
}

function GeoMapDemo() {
  const regions = generateUSMapOutline();
  // Assign random values for choropleth demo
  const regionsWithValues = regions.map((r, i) => ({
    ...r,
    value: 20 + i * 8,
  }));
  return createElement(GeoMap, {
    regions: regionsWithValues,
    markers: [
      { lat: 40.7, lon: -74.0, label: "NYC", color: "#ef4444", radius: 4 },
      { lat: 34.0, lon: -118.2, label: "LA", color: "#3b82f6", radius: 4 },
    ],
    width: 280,
    height: 160,
    showLabels: true,
  });
}

function VectorFieldDemo() {
  return createElement(VectorField, {
    vectorFunction: (x: number, y: number) => ({ dx: -y, dy: x }),
    width: 300,
    height: 320,
    gridSize: 14,
    xRange: [-3, 3],
    yRange: [-3, 3],
    showGrid: true,
    showAxes: true,
    colorByMagnitude: true,
    arrowColor: "#3b82f6",
    tickFontSize: 7,
    arrowWidth: 0.75,
  });
}

function ThreeDLayersDemo() {
  const [rx, setRx] = useState(35);
  const [ry, setRy] = useState(45);
  const [rz, setRz] = useState(0);

  // Generate a 10x10 surface with a peak in the center
  const surface1: number[][] = [];
  const surface2: number[][] = [];
  for (let r = 0; r < 10; r++) {
    const row1: number[] = [];
    const row2: number[] = [];
    for (let c = 0; c < 10; c++) {
      const dx = c - 4.5,
        dy = r - 4.5;
      const dist = Math.sqrt(dx * dx + dy * dy);
      row1.push(Math.max(0, 5 - dist));
      row2.push(Math.max(0, 3.5 - dist * 0.8) * 0.7);
    }
    surface1.push(row1);
    surface2.push(row2);
  }
  return createElement(
    FlexContainer,
    { gap: "16px", alignItems: "flex-start", style: { flexWrap: "wrap" } },
    // Visualization (takes remaining space)
    createElement(
      "div",
      { style: { flex: "1", minWidth: "200px" } },
      createElement(ThreeDLayers, {
        layers: [
          { label: "Surface A", color: "#3b82f6", data: surface1, opacity: 0.8 },
          { label: "Surface B", color: "#10b981", data: surface2, opacity: 0.7 },
        ],
        width: 600,
        height: 400,
        showLabels: true,
        showAxes: true,
        rotateX: rx,
        rotateY: ry,
        rotateZ: rz,
        layerSpacing: 3,
      }),
    ),
    // Rotation controls — compact, dark-mode aware
    createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          minWidth: "70px",
          maxWidth: "80px",
          paddingTop: "4px",
          fontSize: "10px",
          color: "var(--color-text, #1f2937)",
        },
      },
      createElement(NumberSpinner, {
        value: rx,
        onChange: setRx,
        min: -90,
        max: 90,
        step: 5,
        label: "X",
        suffix: "\u00b0",
      }),
      createElement(NumberSpinner, {
        value: ry,
        onChange: setRy,
        min: -90,
        max: 90,
        step: 5,
        label: "Y",
        suffix: "\u00b0",
      }),
      createElement(NumberSpinner, {
        value: rz,
        onChange: setRz,
        min: -90,
        max: 90,
        step: 5,
        label: "Z",
        suffix: "\u00b0",
      }),
    ),
  );
}

// ─── N-Joint Pendulum Physics Demo ───────────────────────────────────

const PEND_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];
const PEND_ARM = 60;
const PEND_G = 0.5;
const PEND_DAMP = 0.999;
const PEND_ITERS = 10;
// Mouse gravity coefficient — mutable ref shared with force functions
let mouseGravityCoeff = 100;
const MOUSE_G = 0.08;

/**
 * Apply mouse gravitational attraction to a node.
 * The cursor acts as a mass 100x the vertex mass, pulling the vertex
 * toward the cursor position regardless of whether the mouse is
 * directly over the vertex. Force = G * m_cursor / r (softened).
 */
function applyMouseAttraction(
  nx: number, ny: number, vx: number, vy: number,
  mouse: MousePosition | null,
): { vx: number; vy: number } {
  if (!mouse) return { vx, vy };
  const dx = mouse.x - nx;
  const dy = mouse.y - ny;
  const distSq = dx * dx + dy * dy;
  if (distSq < 1) return { vx, vy };
  const dist = Math.sqrt(distSq);
  // Softened gravity: force grows with proximity but caps to avoid explosion
  const force = MOUSE_G * mouseGravityCoeff / Math.max(dist, 15);
  return { vx: vx + (dx / dist) * force, vy: vy + (dy / dist) * force };
}

/** Verlet (Position-Based Dynamics) force function */
function createVerletForce(
  n: number,
): (nodes: ForceSimNode[], edges: ForceEdgeType[], w: number, h: number, mouse: MousePosition | null) => ForceSimNode[] {
  const prevPos = new Map<string, { x: number; y: number }>();
  let init = false;

  return (nodes, _edges, _w, _h, mouse) => {
    const pivot = nodes.find((nd) => nd.id === "pivot");
    if (!pivot) return nodes;
    if (!init) {
      for (const nd of nodes) prevPos.set(nd.id, { x: nd.x, y: nd.y });
      init = true;
    }
    const result = nodes.map((nd) => ({ ...nd }));
    for (const nd of result) {
      if (nd.fixed) continue;
      const prev = prevPos.get(nd.id) ?? { x: nd.x, y: nd.y };
      let vx = (nd.x - prev.x) * PEND_DAMP;
      let vy = (nd.y - prev.y) * PEND_DAMP + PEND_G;
      const attr = applyMouseAttraction(nd.x, nd.y, vx, vy, mouse);
      vx = attr.vx; vy = attr.vy;
      prevPos.set(nd.id, { x: nd.x, y: nd.y });
      nd.x += vx;
      nd.y += vy;
    }
    for (let iter = 0; iter < PEND_ITERS; iter++) {
      for (let i = 0; i < result.length - 1; i++) {
        const a = result[i]!, b = result[i + 1]!;
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.001) continue;
        const diff = (dist - PEND_ARM) / dist;
        const ox = dx * diff * 0.5, oy = dy * diff * 0.5;
        if (!a.fixed) { a.x += ox; a.y += oy; }
        if (!b.fixed) { b.x -= ox; b.y -= oy; }
      }
    }
    return result;
  };
}

/** Lagrangian force function using mass matrix solver */
function createLagrangianForce(
  n: number,
): (nodes: ForceSimNode[], edges: ForceEdgeType[], w: number, h: number, mouse: MousePosition | null) => ForceSimNode[] {
  const theta = new Float64Array(n);
  const omega = new Float64Array(n);
  let init = false;
  const dt = 0.03;
  const g = 9.81;
  const L = PEND_ARM;

  return (nodes, _edges, _w, _h, mouse) => {
    const pivot = nodes.find((nd) => nd.id === "pivot");
    if (!pivot) return nodes;

    // Initialize angles from node positions
    if (!init) {
      let px = pivot.x, py = pivot.y;
      for (let i = 0; i < n; i++) {
        const nd = nodes.find((m) => m.id === `m${i + 1}`);
        if (!nd) continue;
        theta[i] = Math.atan2(nd.x - px, nd.y - py);
        px = nd.x; py = nd.y;
      }
      init = true;
    }

    // Build and solve the mass matrix M * alpha = tau
    // M[i][j] = (n - max(i,j)) * cos(theta[i] - theta[j])
    // tau[i] = -sum_j (n - max(i,j)) * omega[j]^2 * sin(theta[i] - theta[j]) - (n - i) * g/L * sin(theta[i])
    const M = matN(n);
    const tau = new Float64Array(n);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const coeff = n - Math.max(i, j);
        const mVal = coeff * Math.cos(theta[i]! - theta[j]!);
        matNSet(M, i, j, mVal);
      }
      let t = 0;
      for (let j = 0; j < n; j++) {
        const coeff = n - Math.max(i, j);
        t -= coeff * omega[j]! * omega[j]! * Math.sin(theta[i]! - theta[j]!);
      }
      t -= (n - i) * (g / L) * Math.sin(theta[i]!);
      tau[i] = t;
    }

    const alpha = solve(M, tau);
    if (alpha) {
      for (let i = 0; i < n; i++) {
        omega[i] += alpha[i]! * dt;
        // Apply damping
        omega[i] *= 0.9995;
      }
    }
    for (let i = 0; i < n; i++) {
      theta[i] += omega[i]! * dt;
    }

    // Convert angles to positions
    const result = nodes.map((nd) => ({ ...nd }));
    let px = pivot.x, py = pivot.y;
    for (let i = 0; i < n; i++) {
      const nd = result.find((m) => m.id === `m${i + 1}`);
      if (!nd) continue;
      nd.x = px + L * Math.sin(theta[i]!);
      nd.y = py + L * Math.cos(theta[i]!);

      // Mouse attraction — add angular impulse
      if (mouse) {
        const dx = mouse.x - nd.x, dy = mouse.y - nd.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
          // Torque = r x F (cross product in 2D)
          const rx = nd.x - px, ry = nd.y - py;
          const fx = (dx / dist) * MOUSE_G * mouseGravityCoeff;
          const fy = (dy / dist) * MOUSE_G * mouseGravityCoeff;
          const torque = (rx * fy - ry * fx) / (L * L);
          omega[i] += torque * dt;
        }
      }

      px = nd.x; py = nd.y;
    }
    return result;
  };
}

type PhysicsMode = "verlet" | "lagrangian";

function buildPendulumNodes(jointCount: number, pivotX: number, pivotY: number) {
  const nodes = [{ id: "pivot", fixed: true, x: pivotX, y: pivotY, color: "#64748b" }];
  for (let i = 0; i < jointCount; i++) {
    const angle = Math.PI / 4 + i * 0.3;
    nodes.push({
      id: `m${i + 1}`,
      x: pivotX + (i + 1) * PEND_ARM * Math.sin(angle),
      y: pivotY + (i + 1) * PEND_ARM * Math.cos(angle),
      color: PEND_COLORS[i % PEND_COLORS.length]!,
    });
  }
  return nodes;
}

function buildPendulumEdges(jointCount: number) {
  const edges = [];
  const ids = ["pivot", ...Array.from({ length: jointCount }, (_, i) => `m${i + 1}`)];
  for (let i = 0; i < ids.length - 1; i++) {
    edges.push({ source: ids[i]!, target: ids[i + 1]!, color: "var(--color-text-muted, #94a3b8)" });
  }
  return edges;
}

function createForce(mode: PhysicsMode, n: number) {
  return mode === "lagrangian" ? createLagrangianForce(n) : createVerletForce(n);
}

function DoublePendulumDemo() {
  const [jointCount, setJointCount] = useState(3);
  const [mode, setMode] = useState<PhysicsMode>("verlet");
  const [gravCoeff, setGravCoeff] = useState(100);
  const forceRef = useRef(createForce(mode, jointCount));

  const handleJointChange = useCallback((n: number) => {
    forceRef.current = createForce(mode, n);
    setJointCount(n);
  }, [mode]);

  const handleModeChange = useCallback((newMode: PhysicsMode) => {
    forceRef.current = createForce(newMode, jointCount);
    setMode(newMode);
  }, [jointCount]);

  const handleGravChange = useCallback((v: number) => {
    mouseGravityCoeff = v;
    setGravCoeff(v);
  }, []);

  const nodes = buildPendulumNodes(jointCount, 200, 50);
  const edges = buildPendulumEdges(jointCount);
  const lastId = `m${jointCount}`;
  const lastClr = PEND_COLORS[(jointCount - 1) % PEND_COLORS.length]!;

  return createElement("div", null,
    createElement(
      FlexContainer,
      { gap: "12px", alignItems: "flex-start", style: { flexWrap: "wrap" } },
      createElement("div", { style: { flex: "1", minWidth: "250px" } },
        createElement(ForceGraph, {
          nodes, edges,
          customForce: forceRef.current,
          trails: [{ nodeId: lastId, color: lastClr, maxPoints: 400, width: 1, opacity: 0.35 }],
          width: 400, height: 350, nodeRadius: 7, showLabels: false, edgeWidth: 2,
        }),
      ),
      createElement("div", {
        style: { display: "flex", flexDirection: "column", gap: "4px", minWidth: "70px", maxWidth: "90px", paddingTop: "4px", fontSize: "10px", color: "var(--color-text, #1f2937)" },
      },
        createElement(NumberSpinner, { value: jointCount, onChange: handleJointChange, min: 2, max: 1000, step: 1, label: "Joints" }),
        createElement(NumberSpinner, { value: gravCoeff, onChange: handleGravChange, min: 1, max: 1000000, step: 10, label: "Cursor mass" }),
      ),
    ),
    // Physics mode radio toggle
    createElement("div", {
      style: { display: "flex", gap: "8px", marginTop: "8px", alignItems: "center", fontSize: "11px", color: "var(--color-text-muted, #64748b)" },
    },
      createElement(Button, { size: "sm", active: mode === "verlet", onClick: () => handleModeChange("verlet") }, "Verlet (PBD)"),
      createElement(Button, { size: "sm", active: mode === "lagrangian", onClick: () => handleModeChange("lagrangian") }, "Lagrangian"),
    ),
  );
}

// ─── Page Layouts ────────────────────────────────────────────────────

const PAGE_LAYOUTS = [
  {
    id: "unity",
    label: "Unity Desktop",
    desc: "Ubuntu Unity-style desktop with launcher and window management",
    component: UnityDesktop,
  },
  {
    id: "word",
    label: "Word Processor",
    desc: "Full-featured word processor with live editing and formatting",
    component: WordProcessor,
  },
  {
    id: "ide",
    label: "IDE",
    desc: "VS Code-style IDE with file tree, syntax highlighting, and editing",
    component: IDE,
  },
  {
    id: "trading",
    label: "Trading Dashboard",
    desc: "Stock trading terminal with live price ticker and market data",
    component: TradingDashboard,
  },
];

function PageLayoutSelector() {
  const [activeLayout, setActiveLayout] = useState<string | null>(null);
  const active = PAGE_LAYOUTS.find((l) => l.id === activeLayout);

  const btnStyle: Record<string, string> = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "14px 18px",
    border: "1px solid var(--color-border, #e2e8f0)",
    borderRadius: "8px",
    background: "var(--color-bg-subtle, #f8fafc)",
    cursor: "pointer",
    fontSize: "14px",
    fontFamily: "inherit",
    textAlign: "left",
    transition: "border-color 0.15s, box-shadow 0.15s",
    marginBottom: "8px",
  };

  return createElement(
    "div",
    null,
    ...PAGE_LAYOUTS.map((layout) =>
      createElement(
        "button",
        {
          key: layout.id,
          style: btnStyle,
          onClick: () => setActiveLayout(layout.id),
          onMouseEnter: (e: Event) => {
            (e.currentTarget as HTMLElement).style.borderColor = "#3b82f6";
          },
          onMouseLeave: (e: Event) => {
            (e.currentTarget as HTMLElement).style.borderColor = "";
          },
        },
        createElement(
          "div",
          null,
          createElement(
            "div",
            {
              style: { fontWeight: "600", color: "var(--color-text, #0f172a)" },
            },
            layout.label,
          ),
          createElement(
            "div",
            {
              style: {
                fontSize: "12px",
                color: "var(--color-text-muted, #64748b)",
                marginTop: "2px",
              },
            },
            layout.desc,
          ),
        ),
        createElement(
          "span",
          {
            style: {
              fontSize: "18px",
              color: "var(--color-text-muted, #94a3b8)",
            },
          },
          "\u2192",
        ),
      ),
    ),

    // Layout dialog overlay
    active
      ? createElement(
          "div",
          {
            style: {
              position: "fixed",
              inset: "0",
              zIndex: "300",
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
            },
            onClick: (e: Event) => {
              if (e.target === e.currentTarget) setActiveLayout(null);
            },
          },
          // Header bar
          createElement(
            "div",
            {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 20px",
                background: "var(--color-bg, #fff)",
                borderBottom: "1px solid var(--color-border, #e2e8f0)",
              },
            },
            createElement(
              "span",
              { style: { fontWeight: "700", fontSize: "16px" } },
              active.label,
            ),
            createElement(
              "button",
              {
                onClick: () => setActiveLayout(null),
                style: {
                  width: "32px",
                  height: "32px",
                  border: "none",
                  background: "#dc2626",
                  borderRadius: "50%",
                  color: "white",
                  fontWeight: "700",
                  fontSize: "16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                },
              },
              "\u00d7",
            ),
          ),
          // Layout content
          createElement(
            "div",
            {
              style: { flex: "1", overflow: "auto" },
            },
            createElement(active.component, null),
          ),
        )
      : null,
  );
}
