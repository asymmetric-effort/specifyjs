# Component Library Reference

65 components across 9 families. All zero-dependency, pure SpecifyJS, ARIA accessible, keyboard navigable.

## Layout (10)

| Component | Description | Docs |
|-----------|-------------|------|
| Grid | CSS Grid container with areas, responsive breakpoints | [layout/grid.md](layout/grid.md) |
| FlexContainer | Flexbox layout with FlexItem children | [layout/flex-container.md](layout/flex-container.md) |
| Card | Content card with header/body/footer/image slots | [layout/card.md](layout/card.md) |
| Panel | Collapsible panel with animated transition | [layout/panel.md](layout/panel.md) |
| Splitter | Resizable split pane with draggable divider | [layout/splitter.md](layout/splitter.md) |
| Tabs | Tabbed content with line/card/pill variants | [layout/tabs.md](layout/tabs.md) |
| ScrollContainer | Scrollable container with edge shadow indicators | [layout/scroll-container.md](layout/scroll-container.md) |
| DraggableWindow | Draggable, resizable window with title bar and edge snapping | [layout/draggable-window.md](layout/draggable-window.md) |
| WindowManager | Context provider for multi-window state management | [layout/window-manager.md](layout/window-manager.md) |
| DesktopBackground | Full-area workspace background with color/gradient/image | [layout/desktop-background.md](layout/desktop-background.md) |

## Form (14)

| Component | Description | Docs |
|-----------|-------------|------|
| FormFieldWrapper | Base wrapper with label, help text, error display | [form/wrapper.md](form/wrapper.md) |
| TextField | Single-line input with prefix/suffix slots | [form/textfield.md](form/textfield.md) |
| MultilineField | Textarea with auto-resize and character count | [form/multiline.md](form/multiline.md) |
| TextEditor | WYSIWYG rich text editor with toolbar | [form/texteditor.md](form/texteditor.md) |
| Select | Custom dropdown with search, multi-select, groups | [form/select.md](form/select.md) |
| Checkbox | Styled checkbox with indeterminate state | [form/checkbox.md](form/checkbox.md) |
| RadioGroup | Radio button group with horizontal/vertical layout | [form/radio.md](form/radio.md) |
| Toggle | Sliding pill switch with configurable colors | [form/toggle.md](form/toggle.md) |
| Slider | Range slider with marks, dual-handle mode | [form/slider.md](form/slider.md) |
| DatePicker | Calendar dropdown with month/year navigation | [form/datepicker.md](form/datepicker.md) |
| TimePicker | Hour/minute spinners with 12h/24h format | [form/timepicker.md](form/timepicker.md) |
| ColorPicker | Swatch grid with hex input | [form/color-picker.md](form/color-picker.md) |
| FileUpload | Drag-and-drop zone with file list | [form/file-upload.md](form/file-upload.md) |
| NumberSpinner | Numeric input with +/- buttons | [form/number-spinner.md](form/number-spinner.md) |

## Navigation (12)

| Component | Description | Docs |
|-----------|-------------|------|
| NavWrapper | Base container with orientation, ARIA, keyboard nav | [nav/wrapper.md](nav/wrapper.md) |
| Dropdown | Dropdown menu with nested submenus | [nav/dropdown.md](nav/dropdown.md) |
| TreeNav | Tree navigation with extensible TreeNode class | [nav/treenav.md](nav/treenav.md) |
| Accordion | Collapsible sections with animated transitions | [nav/accordion.md](nav/accordion.md) |
| Breadcrumb | Breadcrumb trail with separator and collapse | [nav/breadcrumb.md](nav/breadcrumb.md) |
| Pagination | Page numbers with ellipsis and prev/next | [nav/pagination.md](nav/pagination.md) |
| Stepper | Step wizard with circle/dot variants | [nav/stepper.md](nav/stepper.md) |
| Sidebar | Collapsible sidebar with nested sections | [nav/sidebar.md](nav/sidebar.md) |
| Toolbar | Horizontal toolbar with button groups | [nav/toolbar.md](nav/toolbar.md) |
| Menubar | Menu bar with hover-switch dropdowns | [nav/menubar.md](nav/menubar.md) |
| Dock | Application launcher bar with active indicators and badges | [nav/dock.md](nav/dock.md) |
| SystemTray | Top panel with clock, indicators, and user menu | [nav/system-tray.md](nav/system-tray.md) |

## Overlay (6)

| Component | Description | Docs |
|-----------|-------------|------|
| Modal | Dialog with backdrop and focus trap | [overlay/modal.md](overlay/modal.md) |
| Drawer | Slide-in panel from any edge | [overlay/drawer.md](overlay/drawer.md) |
| Popover | Positioned popover with arrow | [overlay/popover.md](overlay/popover.md) |
| Tooltip | Hover tooltip with delay | [overlay/tooltip.md](overlay/tooltip.md) |
| Toast | Notification system with useToast hook | [overlay/toast.md](overlay/toast.md) |
| ContextMenu | Right-click menu with nested submenus | [overlay/context-menu.md](overlay/context-menu.md) |

## Data Display (6)

| Component | Description | Docs |
|-----------|-------------|------|
| DataGrid | Full-featured table with sort, filter, pagination | [data/data-grid.md](data/data-grid.md) |
| ListView | Styled list with custom item rendering | [data/list-view.md](data/list-view.md) |
| VirtualScroll | Virtualized list for large datasets | [data/virtual-scroll.md](data/virtual-scroll.md) |
| Tag | Rounded pill with solid/outline/subtle variants | [data/tag.md](data/tag.md) |
| Badge | Count or dot indicator overlay | [data/badge.md](data/badge.md) |
| Avatar | Image/initials avatar with status dot | [data/avatar.md](data/avatar.md) |

## Feedback (5)

| Component | Description | Docs |
|-----------|-------------|------|
| ProgressBar | Bar and circular progress indicators | [feedback/progress-bar.md](feedback/progress-bar.md) |
| Spinner | Rotating loading spinner | [feedback/spinner.md](feedback/spinner.md) |
| Skeleton | Content placeholder with shimmer animation | [feedback/skeleton.md](feedback/skeleton.md) |
| Alert | Info/success/warning/error banners | [feedback/alert.md](feedback/alert.md) |
| EmptyState | Empty content placeholder with CTA | [feedback/empty-state.md](feedback/empty-state.md) |

## Media (3)

| Component | Description | Docs |
|-----------|-------------|------|
| Image | Enhanced image with lazy loading and fallback | [media/image.md](media/image.md) |
| Carousel | Image/content slider with arrows and dots | [media/carousel.md](media/carousel.md) |
| VideoPlayer | Video player with custom controls overlay | [media/video-player.md](media/video-player.md) |

## Page Layouts (4)

| Component | Description | Docs |
|-----------|-------------|------|
| UnityDesktop | Configurable Unity desktop with WindowManager, Dock, SystemTray, and DraggableWindow integration | [page/unity-desktop.md](page/unity-desktop.md) |
| WordProcessor | Word processor layout with menu bar, toolbar, ruler, and document page | [page/word-processor.md](page/word-processor.md) |
| IDE | VS Code-style IDE with file explorer, editor, terminal, and status bar | [page/ide.md](page/ide.md) |
| TradingDashboard | Stock trading terminal with chart, order book, and watchlist grid | [page/trading-dashboard.md](page/trading-dashboard.md) |

## Visualization (5)

| Component | Description | Docs |
|-----------|-------------|------|
| VizWrapper | Container with title, legend, CSS isolation | [viz/wrapper.md](viz/wrapper.md) |
| HypercubeGraph | N-dimensional hypercube with rotation | [viz/graph.md](viz/graph.md) |
| LineGraph | 2D line chart with multi-line support | [viz/2D-line-graph.md](viz/2D-line-graph.md) |
| BarGraph | Vertical/horizontal bar chart | [viz/2D-bar-graph.md](viz/2D-bar-graph.md) |
| PieGraph | Pie and donut chart | [viz/2D-pie-graph.md](viz/2D-pie-graph.md) |
