// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * SystemTray -- Horizontal status bar for the top edge of a desktop layout.
 *
 * Displays the active application name, a real-time clock, system status
 * indicators (icons with optional labels), and a user menu with avatar
 * and name. Inspired by the Ubuntu Unity / GNOME top panel.
 */

import { createElement } from '../../../../core/src/index';
import { useState, useEffect, useCallback, useMemo, useRef } from '../../../../core/src/hooks/index';
import { useHover } from '../../wrapper/src/NavWrapper';

// -- Types ------------------------------------------------------------------

export interface SystemTrayIndicator {
  /** Unique identifier */
  id: string;
  /** Icon -- emoji, text character, or image URL */
  icon: string;
  /** Optional label shown next to the icon */
  label?: string;
  /** Click handler */
  onClick?: () => void;
}

export interface SystemTrayUser {
  /** Display name */
  name: string;
  /** Avatar URL or emoji fallback */
  avatar?: string;
}

export interface SystemTrayProps {
  /** Text shown on the left -- typically the active application name */
  activeAppName?: string;

  /** Optional left-most button (e.g., "Activities"). Fires onClick. */
  activitiesButton?: {
    label: string;
    onClick: () => void;
  };

  /** Clock format. Default: '24h'. Options: '12h', '24h' */
  clockFormat?: '12h' | '24h';

  /** Whether to show seconds in the clock. Default: true */
  showSeconds?: boolean;

  /** Whether to show the date below/beside the clock. Default: true */
  showDate?: boolean;

  /** System status indicators displayed in the right section */
  indicators?: SystemTrayIndicator[];

  /** User profile -- shown at the far right with avatar and name */
  user?: SystemTrayUser;

  /** Items in the user dropdown menu (shown on click) */
  userMenuItems?: Array<{
    label: string;
    icon?: string;
    onClick: () => void;
    divider?: boolean;
  }>;

  /** Panel height in pixels. Default: 28 */
  height?: number;

  /** Children -- additional elements to render in the center area */
  children?: unknown;
}

// -- Clock helpers ----------------------------------------------------------

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function pad2(n: number): string {
  return n < 10 ? '0' + String(n) : String(n);
}

function formatTime(date: Date, format: '12h' | '24h', showSeconds: boolean): string {
  let hours = date.getHours();
  const minutes = pad2(date.getMinutes());
  const seconds = pad2(date.getSeconds());

  if (format === '12h') {
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const time = showSeconds
      ? `${String(hours)}:${minutes}:${seconds}`
      : `${String(hours)}:${minutes}`;
    return `${time} ${ampm}`;
  }

  const hh = pad2(hours);
  return showSeconds
    ? `${hh}:${minutes}:${seconds}`
    : `${hh}:${minutes}`;
}

function formatDate(date: Date): string {
  const day = DAYS[date.getDay()];
  const month = MONTHS[date.getMonth()];
  const d = date.getDate();
  return `${day}, ${month} ${String(d)}`;
}

// -- Internal: ActivitiesButton ---------------------------------------------

function ActivitiesButton(props: { label: string; onClick: () => void }) {
  const { label, onClick } = props;
  const { hover, onMouseEnter, onMouseLeave } = useHover();

  const handleClick = useCallback(() => {
    onClick();
  }, [onClick]);

  const handleKeyDown = useCallback((e: Event) => {
    const ke = e as KeyboardEvent;
    if (ke.key === 'Enter' || ke.key === ' ') {
      ke.preventDefault();
      onClick();
    }
  }, [onClick]);

  return createElement('button', {
    type: 'button',
    role: 'button',
    'aria-label': label,
    tabIndex: 0,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    onMouseEnter,
    onMouseLeave,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0 12px',
      height: '100%',
      border: 'none',
      outline: 'none',
      backgroundColor: hover ? 'rgba(255,255,255,0.15)' : 'transparent',
      color: 'inherit',
      fontFamily: 'inherit',
      fontSize: '13px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'background-color 0.15s',
    },
  }, label);
}

// -- Internal: Clock --------------------------------------------------------

function Clock(props: {
  format: '12h' | '24h';
  showSeconds: boolean;
  showDate: boolean;
}) {
  const { format, showSeconds, showDate } = props;
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => {
      clearInterval(id);
    };
  }, []);

  const timeStr = useMemo(() => formatTime(now, format, showSeconds), [now, format, showSeconds]);
  const dateStr = useMemo(() => formatDate(now), [now]);

  const dateEl = showDate
    ? createElement('span', {
        style: { fontSize: '11px', opacity: '0.85' },
      }, dateStr)
    : null;

  return createElement('div', {
    role: 'timer',
    'aria-live': 'polite',
    'aria-label': 'System clock',
    style: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      lineHeight: '1',
      padding: '0 8px',
    },
  },
    dateEl,
    createElement('span', {
      style: { fontSize: '13px', fontWeight: '500' },
    }, timeStr),
  );
}

// -- Internal: IndicatorButton ----------------------------------------------

function IndicatorButton(props: { indicator: SystemTrayIndicator }) {
  const { indicator } = props;
  const { hover, onMouseEnter, onMouseLeave } = useHover();

  const handleClick = useCallback(() => {
    if (indicator.onClick) indicator.onClick();
  }, [indicator]);

  const handleKeyDown = useCallback((e: Event) => {
    const ke = e as KeyboardEvent;
    if (ke.key === 'Enter' || ke.key === ' ') {
      ke.preventDefault();
      if (indicator.onClick) indicator.onClick();
    }
  }, [indicator]);

  return createElement('button', {
    type: 'button',
    role: 'button',
    'aria-label': indicator.label || indicator.icon,
    tabIndex: 0,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    onMouseEnter,
    onMouseLeave,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '0 4px',
      height: '100%',
      border: 'none',
      outline: 'none',
      backgroundColor: hover ? 'rgba(255,255,255,0.15)' : 'transparent',
      color: 'inherit',
      fontFamily: 'inherit',
      fontSize: '13px',
      cursor: indicator.onClick ? 'pointer' : 'default',
      transition: 'background-color 0.15s',
    },
  },
    createElement('span', { 'aria-hidden': 'true' }, indicator.icon),
    indicator.label
      ? createElement('span', null, indicator.label)
      : null,
  );
}

// -- Internal: UserMenuDropdown ---------------------------------------------

function UserMenuDropdownItem(props: {
  item: { label: string; icon?: string; onClick: () => void; divider?: boolean };
  onClose: () => void;
}) {
  const { item, onClose } = props;
  const { hover, onMouseEnter, onMouseLeave } = useHover();

  if (item.divider) {
    return createElement('div', {
      role: 'separator',
      style: {
        height: '1px',
        backgroundColor: 'var(--panel-divider, #555555)',
        margin: '4px 0',
      },
    });
  }

  const handleClick = useCallback(() => {
    item.onClick();
    onClose();
  }, [item, onClose]);

  const handleKeyDown = useCallback((e: Event) => {
    const ke = e as KeyboardEvent;
    if (ke.key === 'Enter' || ke.key === ' ') {
      ke.preventDefault();
      item.onClick();
      onClose();
    }
  }, [item, onClose]);

  return createElement('button', {
    type: 'button',
    role: 'menuitem',
    tabIndex: -1,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    onMouseEnter,
    onMouseLeave,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      width: '100%',
      padding: '6px 16px',
      border: 'none',
      outline: 'none',
      backgroundColor: hover
        ? 'var(--panel-hover, rgba(255,255,255,0.15))'
        : 'transparent',
      color: 'var(--panel-text, #ffffff)',
      fontFamily: 'inherit',
      fontSize: '13px',
      textAlign: 'left',
      cursor: 'pointer',
      boxSizing: 'border-box',
      transition: 'background-color 0.1s',
    },
  },
    item.icon
      ? createElement('span', { style: { width: '16px', textAlign: 'center' }, 'aria-hidden': 'true' }, item.icon)
      : null,
    createElement('span', null, item.label),
  );
}

// -- Internal: UserMenu -----------------------------------------------------

function UserMenu(props: {
  user: SystemTrayUser;
  menuItems?: SystemTrayProps['userMenuItems'];
}) {
  const { user, menuItems } = props;
  const { hover, onMouseEnter, onMouseLeave } = useHover();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);

  const handleToggle = useCallback(() => {
    setOpen((prev: boolean) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleKeyDown = useCallback((e: Event) => {
    const ke = e as KeyboardEvent;
    if (ke.key === 'Enter' || ke.key === ' ') {
      ke.preventDefault();
      setOpen((prev: boolean) => !prev);
    }
    if (ke.key === 'Escape') {
      setOpen(false);
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    const handleDocClick = (e: Event) => {
      const container = containerRef.current;
      if (container && !container.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('click', handleDocClick, true);
    return () => {
      document.removeEventListener('click', handleDocClick, true);
    };
  }, [open]);

  // Avatar element
  const avatarStyle: Record<string, string> = {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'inherit',
    overflow: 'hidden',
    flexShrink: '0',
  };

  const avatarContent = user.avatar
    ? createElement('img', {
        src: user.avatar,
        alt: user.name,
        style: { width: '100%', height: '100%', objectFit: 'cover' },
      })
    : user.name.charAt(0).toUpperCase();

  const avatarEl = createElement('span', {
    style: avatarStyle,
    'aria-hidden': 'true',
  }, avatarContent);

  // Dropdown menu
  const dropdown = open && menuItems && menuItems.length > 0
    ? createElement('div', {
        role: 'menu',
        'aria-label': 'User menu',
        style: {
          position: 'absolute',
          top: '100%',
          right: '0',
          marginTop: '2px',
          backgroundColor: 'var(--panel-bg, #2c2c2c)',
          border: '1px solid var(--panel-divider, #555555)',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          padding: '4px 0',
          minWidth: '180px',
          zIndex: '1000',
        },
      },
        ...menuItems.map(
          (item: { label: string; icon?: string; onClick: () => void; divider?: boolean }, i: number) =>
            createElement(UserMenuDropdownItem, {
              key: String(i),
              item,
              onClose: handleClose,
            }),
        ),
      )
    : null;

  return createElement('div', {
    ref: containerRef,
    style: { position: 'relative', display: 'inline-flex', height: '100%' },
  },
    createElement('button', {
      type: 'button',
      'aria-haspopup': 'true',
      'aria-expanded': String(open),
      tabIndex: 0,
      onClick: handleToggle,
      onKeyDown: handleKeyDown,
      onMouseEnter,
      onMouseLeave,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '0 8px',
        height: '100%',
        border: 'none',
        outline: 'none',
        backgroundColor: hover || open
          ? 'rgba(255,255,255,0.15)'
          : 'transparent',
        color: 'inherit',
        fontFamily: 'inherit',
        fontSize: '13px',
        cursor: 'pointer',
        transition: 'background-color 0.15s',
      },
    },
      avatarEl,
      createElement('span', null, user.name),
      createElement('span', { 'aria-hidden': 'true', style: { fontSize: '10px' } }, '\u25BE'),
    ),
    dropdown,
  );
}

// -- Main SystemTray component ----------------------------------------------

export function SystemTray(props: SystemTrayProps) {
  const {
    activeAppName,
    activitiesButton,
    clockFormat = '24h',
    showSeconds = true,
    showDate = true,
    indicators,
    user,
    userMenuItems,
    height = 28,
    children,
  } = props;

  const heightPx = String(height) + 'px';

  // -- Left section --
  const leftChildren: unknown[] = [];

  if (activitiesButton) {
    leftChildren.push(
      createElement(ActivitiesButton, {
        key: 'activities',
        label: activitiesButton.label,
        onClick: activitiesButton.onClick,
      }),
    );
  }

  if (activeAppName) {
    leftChildren.push(
      createElement('span', {
        key: 'appname',
        style: {
          padding: '0 12px',
          fontSize: '13px',
          fontWeight: '700',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '200px',
        },
      }, activeAppName),
    );
  }

  const leftSection = createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      flex: '1',
      minWidth: '0',
    },
  }, ...leftChildren);

  // -- Center section (clock + children) --
  const centerChildren: unknown[] = [];

  centerChildren.push(
    createElement(Clock, {
      key: 'clock',
      format: clockFormat,
      showSeconds,
      showDate,
    }),
  );

  if (children) {
    centerChildren.push(children);
  }

  const centerSection = createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    },
  }, ...centerChildren);

  // -- Right section (indicators + user menu) --
  const rightChildren: unknown[] = [];

  if (indicators && indicators.length > 0) {
    const indicatorEls = indicators.map((ind: SystemTrayIndicator) =>
      createElement(IndicatorButton, {
        key: ind.id,
        indicator: ind,
      }),
    );
    rightChildren.push(
      createElement('div', {
        key: 'indicators',
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          height: '100%',
        },
      }, ...indicatorEls),
    );
  }

  if (user) {
    rightChildren.push(
      createElement(UserMenu, {
        key: 'user',
        user,
        menuItems: userMenuItems,
      }),
    );
  }

  const rightSection = createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      height: '100%',
      flex: '1',
      gap: '4px',
    },
  }, ...rightChildren);

  // -- Panel container --
  return createElement('div', {
    role: 'menubar',
    'aria-label': 'System panel',
    'data-theme': 'dark',
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      height: heightPx,
      backgroundColor: 'var(--panel-bg, #2c2c2c)',
      color: 'var(--panel-text, #ffffff)',
      fontFamily: 'inherit',
      fontSize: '13px',
      boxSizing: 'border-box',
      position: 'relative',
    },
  },
    leftSection,
    centerSection,
    rightSection,
  );
}
