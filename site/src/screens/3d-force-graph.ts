// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * 3D Force Graph Demo — Internet AS Topology
 *
 * Renders ~60 autonomous systems with BGP peering relationships as a
 * 3D force-directed graph. Nodes are colored and sized by tier:
 *   - Tier 1 transit providers: large red spheres
 *   - Tier 2 regional/CDN: medium blue spheres
 *   - Tier 3 access ISPs: small green spheres
 *   - IXP/interesting: yellow octahedra
 *
 * Edges represent BGP peering with style/color indicating peering type.
 */

import { createElement } from 'specifyjs';
import { useHead } from 'specifyjs/hooks';
import { ForceGraph3D } from '../../../components/viz/3d-force-graph/src/index';
import type { ForceGraph3DNode, ForceGraph3DEdge } from '../../../components/viz/3d-force-graph/src/types';

// ── Dataset: Autonomous Systems ─────────────────────────────────────

interface ASEntry {
  asn: string;
  name: string;
  tier: 'tier1' | 'tier2' | 'tier3' | 'ixp';
}

const TIER1_COLOR = { r: 0.9, g: 0.2, b: 0.2, a: 1 };
const TIER2_COLOR = { r: 0.2, g: 0.4, b: 0.9, a: 1 };
const TIER3_COLOR = { r: 0.2, g: 0.8, b: 0.3, a: 1 };
const IXP_COLOR   = { r: 0.95, g: 0.85, b: 0.2, a: 1 };

const TEXT_COLOR = { r: 1, g: 1, b: 1, a: 1 };

const AS_LIST: ASEntry[] = [
  // Tier 1 transit providers
  { asn: 'AS3356',  name: 'Lumen/Level3',    tier: 'tier1' },
  { asn: 'AS1299',  name: 'Arelion/Telia',   tier: 'tier1' },
  { asn: 'AS174',   name: 'Cogent',           tier: 'tier1' },
  { asn: 'AS6762',  name: 'Telecom Italia',   tier: 'tier1' },
  { asn: 'AS3257',  name: 'GTT',              tier: 'tier1' },
  { asn: 'AS6830',  name: 'Liberty Global',   tier: 'tier1' },
  { asn: 'AS2914',  name: 'NTT',              tier: 'tier1' },
  { asn: 'AS5511',  name: 'Orange',           tier: 'tier1' },
  { asn: 'AS6453',  name: 'Tata',             tier: 'tier1' },
  { asn: 'AS1239',  name: 'Sprint',           tier: 'tier1' },

  // Tier 2 regional/CDN
  { asn: 'AS13335', name: 'Cloudflare',       tier: 'tier2' },
  { asn: 'AS16509', name: 'Amazon/AWS',       tier: 'tier2' },
  { asn: 'AS15169', name: 'Google',           tier: 'tier2' },
  { asn: 'AS8075',  name: 'Microsoft',        tier: 'tier2' },
  { asn: 'AS32934', name: 'Facebook/Meta',    tier: 'tier2' },
  { asn: 'AS20940', name: 'Akamai',           tier: 'tier2' },
  { asn: 'AS46489', name: 'Twitch',           tier: 'tier2' },
  { asn: 'AS14618', name: 'Amazon',           tier: 'tier2' },
  { asn: 'AS36351', name: 'SoftLayer',        tier: 'tier2' },
  { asn: 'AS19551', name: 'Incapsula',        tier: 'tier2' },

  // Tier 3 access ISPs
  { asn: 'AS7922',  name: 'Comcast',          tier: 'tier3' },
  { asn: 'AS701',   name: 'Verizon',          tier: 'tier3' },
  { asn: 'AS22773', name: 'Cox',              tier: 'tier3' },
  { asn: 'AS209',   name: 'CenturyLink',      tier: 'tier3' },
  { asn: 'AS6128',  name: 'Cablevision',      tier: 'tier3' },
  { asn: 'AS20001', name: 'Charter',          tier: 'tier3' },
  { asn: 'AS11351', name: 'Charter TWC',      tier: 'tier3' },
  { asn: 'AS10796', name: 'Charter BHN',      tier: 'tier3' },
  { asn: 'AS33491', name: 'Comcast Bus.',     tier: 'tier3' },
  { asn: 'AS7018',  name: 'AT&T',             tier: 'tier3' },

  // IXPs / interesting nodes
  { asn: 'AS6695',  name: 'DE-CIX',           tier: 'ixp' },
  { asn: 'AS47541', name: 'VKontakte',        tier: 'ixp' },
  { asn: 'AS24940', name: 'Hetzner',          tier: 'ixp' },
  { asn: 'AS714',   name: 'Apple',            tier: 'ixp' },
  { asn: 'AS36459', name: 'GitHub',           tier: 'ixp' },
];

function tierConfig(tier: ASEntry['tier']): {
  color: typeof TIER1_COLOR;
  size: number;
  shape: ForceGraph3DNode['shape'];
  mass: number;
} {
  switch (tier) {
    case 'tier1': return { color: TIER1_COLOR, size: 2.5, shape: 'sphere', mass: 3.0 };
    case 'tier2': return { color: TIER2_COLOR, size: 1.6, shape: 'sphere', mass: 2.0 };
    case 'tier3': return { color: TIER3_COLOR, size: 1.0, shape: 'sphere', mass: 1.0 };
    case 'ixp':   return { color: IXP_COLOR,   size: 1.8, shape: 'octahedron', mass: 1.5 };
  }
}

// Build nodes
const NODES: ForceGraph3DNode[] = AS_LIST.map((as) => {
  const cfg = tierConfig(as.tier);
  return {
    id: as.asn,
    label: as.asn,
    size: cfg.size,
    color: cfg.color,
    shape: cfg.shape,
    mass: cfg.mass,
    textColor: TEXT_COLOR,
  };
});

// ── Dataset: BGP Peering Edges ──────────────────────────────────────

// Edge style helpers
const TIER1_PEER_COLOR   = { r: 1.0, g: 1.0, b: 1.0, a: 1 };   // white
const TIER1_T2_COLOR     = { r: 0.0, g: 0.8, b: 0.9, a: 1 };   // cyan
const T2_T3_COLOR        = { r: 0.5, g: 0.5, b: 0.5, a: 1 };   // gray
const SAME_TIER_COLOR    = { r: 0.6, g: 0.6, b: 0.7, a: 1 };   // light gray

interface PeerDef {
  source: string;
  target: string;
  type: 'tier1-tier1' | 'tier1-tier2' | 'tier2-tier3' | 'same-tier';
}

function edgeStyle(type: PeerDef['type']): Partial<ForceGraph3DEdge> {
  switch (type) {
    case 'tier1-tier1':
      return { thickness: 0.25, color: TIER1_PEER_COLOR, style: 'cylinder-solid' };
    case 'tier1-tier2':
      return { thickness: 0.15, color: TIER1_T2_COLOR, style: 'cylinder-solid' };
    case 'tier2-tier3':
      return { thickness: 0.08, color: T2_T3_COLOR, style: 'cylinder-solid' };
    case 'same-tier':
      return { thickness: 0.10, color: SAME_TIER_COLOR, style: 'cylinder-mesh' };
  }
}

const PEERING: PeerDef[] = [
  // Tier 1 <-> Tier 1 (full mesh among major transit)
  { source: 'AS3356', target: 'AS1299',  type: 'tier1-tier1' },
  { source: 'AS3356', target: 'AS174',   type: 'tier1-tier1' },
  { source: 'AS3356', target: 'AS2914',  type: 'tier1-tier1' },
  { source: 'AS3356', target: 'AS3257',  type: 'tier1-tier1' },
  { source: 'AS3356', target: 'AS6453',  type: 'tier1-tier1' },
  { source: 'AS3356', target: 'AS5511',  type: 'tier1-tier1' },
  { source: 'AS1299', target: 'AS174',   type: 'tier1-tier1' },
  { source: 'AS1299', target: 'AS2914',  type: 'tier1-tier1' },
  { source: 'AS1299', target: 'AS6762',  type: 'tier1-tier1' },
  { source: 'AS1299', target: 'AS5511',  type: 'tier1-tier1' },
  { source: 'AS174',  target: 'AS2914',  type: 'tier1-tier1' },
  { source: 'AS174',  target: 'AS3257',  type: 'tier1-tier1' },
  { source: 'AS174',  target: 'AS1239',  type: 'tier1-tier1' },
  { source: 'AS6762', target: 'AS6453',  type: 'tier1-tier1' },
  { source: 'AS6762', target: 'AS5511',  type: 'tier1-tier1' },
  { source: 'AS3257', target: 'AS6830',  type: 'tier1-tier1' },
  { source: 'AS3257', target: 'AS2914',  type: 'tier1-tier1' },
  { source: 'AS2914', target: 'AS6453',  type: 'tier1-tier1' },
  { source: 'AS2914', target: 'AS5511',  type: 'tier1-tier1' },
  { source: 'AS5511', target: 'AS6453',  type: 'tier1-tier1' },
  { source: 'AS6830', target: 'AS1239',  type: 'tier1-tier1' },
  { source: 'AS1239', target: 'AS3356',  type: 'tier1-tier1' },

  // Tier 1 <-> Tier 2 (transit purchases)
  { source: 'AS3356', target: 'AS13335', type: 'tier1-tier2' },
  { source: 'AS3356', target: 'AS16509', type: 'tier1-tier2' },
  { source: 'AS3356', target: 'AS20940', type: 'tier1-tier2' },
  { source: 'AS3356', target: 'AS36351', type: 'tier1-tier2' },
  { source: 'AS1299', target: 'AS15169', type: 'tier1-tier2' },
  { source: 'AS1299', target: 'AS8075',  type: 'tier1-tier2' },
  { source: 'AS1299', target: 'AS13335', type: 'tier1-tier2' },
  { source: 'AS174',  target: 'AS16509', type: 'tier1-tier2' },
  { source: 'AS174',  target: 'AS32934', type: 'tier1-tier2' },
  { source: 'AS174',  target: 'AS19551', type: 'tier1-tier2' },
  { source: 'AS2914', target: 'AS15169', type: 'tier1-tier2' },
  { source: 'AS2914', target: 'AS8075',  type: 'tier1-tier2' },
  { source: 'AS2914', target: 'AS46489', type: 'tier1-tier2' },
  { source: 'AS3257', target: 'AS20940', type: 'tier1-tier2' },
  { source: 'AS3257', target: 'AS14618', type: 'tier1-tier2' },
  { source: 'AS6453', target: 'AS32934', type: 'tier1-tier2' },
  { source: 'AS6453', target: 'AS16509', type: 'tier1-tier2' },
  { source: 'AS5511', target: 'AS15169', type: 'tier1-tier2' },
  { source: 'AS5511', target: 'AS13335', type: 'tier1-tier2' },
  { source: 'AS6762', target: 'AS8075',  type: 'tier1-tier2' },
  { source: 'AS6830', target: 'AS20940', type: 'tier1-tier2' },
  { source: 'AS1239', target: 'AS32934', type: 'tier1-tier2' },

  // Tier 2 <-> Tier 3 (downstream ISPs)
  { source: 'AS16509', target: 'AS7922',  type: 'tier2-tier3' },
  { source: 'AS16509', target: 'AS701',   type: 'tier2-tier3' },
  { source: 'AS15169', target: 'AS7922',  type: 'tier2-tier3' },
  { source: 'AS15169', target: 'AS7018',  type: 'tier2-tier3' },
  { source: 'AS13335', target: 'AS7018',  type: 'tier2-tier3' },
  { source: 'AS13335', target: 'AS22773', type: 'tier2-tier3' },
  { source: 'AS8075',  target: 'AS701',   type: 'tier2-tier3' },
  { source: 'AS8075',  target: 'AS20001', type: 'tier2-tier3' },
  { source: 'AS32934', target: 'AS7922',  type: 'tier2-tier3' },
  { source: 'AS32934', target: 'AS7018',  type: 'tier2-tier3' },
  { source: 'AS20940', target: 'AS209',   type: 'tier2-tier3' },
  { source: 'AS20940', target: 'AS6128',  type: 'tier2-tier3' },
  { source: 'AS46489', target: 'AS7922',  type: 'tier2-tier3' },
  { source: 'AS14618', target: 'AS701',   type: 'tier2-tier3' },
  { source: 'AS36351', target: 'AS22773', type: 'tier2-tier3' },
  { source: 'AS19551', target: 'AS33491', type: 'tier2-tier3' },
  { source: 'AS16509', target: 'AS11351', type: 'tier2-tier3' },
  { source: 'AS15169', target: 'AS10796', type: 'tier2-tier3' },

  // Same-tier peering (settlement-free / IXP)
  { source: 'AS13335', target: 'AS15169', type: 'same-tier' },
  { source: 'AS13335', target: 'AS32934', type: 'same-tier' },
  { source: 'AS16509', target: 'AS15169', type: 'same-tier' },
  { source: 'AS16509', target: 'AS8075',  type: 'same-tier' },
  { source: 'AS7922',  target: 'AS7018',  type: 'same-tier' },
  { source: 'AS7922',  target: 'AS701',   type: 'same-tier' },
  { source: 'AS701',   target: 'AS7018',  type: 'same-tier' },
  { source: 'AS20001', target: 'AS11351', type: 'same-tier' },
  { source: 'AS20001', target: 'AS10796', type: 'same-tier' },

  // IXP connections
  { source: 'AS6695',  target: 'AS3356',  type: 'tier1-tier2' },
  { source: 'AS6695',  target: 'AS1299',  type: 'tier1-tier2' },
  { source: 'AS6695',  target: 'AS13335', type: 'same-tier' },
  { source: 'AS6695',  target: 'AS15169', type: 'same-tier' },
  { source: 'AS6695',  target: 'AS24940', type: 'same-tier' },
  { source: 'AS47541', target: 'AS1299',  type: 'tier1-tier2' },
  { source: 'AS47541', target: 'AS6762',  type: 'tier1-tier2' },
  { source: 'AS24940', target: 'AS3356',  type: 'tier1-tier2' },
  { source: 'AS24940', target: 'AS174',   type: 'tier1-tier2' },
  { source: 'AS714',   target: 'AS2914',  type: 'tier1-tier2' },
  { source: 'AS714',   target: 'AS3356',  type: 'tier1-tier2' },
  { source: 'AS714',   target: 'AS15169', type: 'same-tier' },
  { source: 'AS36459', target: 'AS16509', type: 'same-tier' },
  { source: 'AS36459', target: 'AS13335', type: 'same-tier' },
  { source: 'AS36459', target: 'AS3356',  type: 'tier1-tier2' },
];

// Build edges
const EDGES: ForceGraph3DEdge[] = PEERING.map((p) => {
  const style = edgeStyle(p.type);
  return {
    source: p.source,
    target: p.target,
    ...style,
  } as ForceGraph3DEdge;
});

// ── Stats ───────────────────────────────────────────────────────────

const TIER_COUNTS = {
  tier1: AS_LIST.filter(a => a.tier === 'tier1').length,
  tier2: AS_LIST.filter(a => a.tier === 'tier2').length,
  tier3: AS_LIST.filter(a => a.tier === 'tier3').length,
  ixp:   AS_LIST.filter(a => a.tier === 'ixp').length,
};

// ── Component ───────────────────────────────────────────────────────

export function ForceGraph3DDemo() {
  useHead({
    title: '3D Force Graph - Internet AS Topology - SpecifyJS',
    description: 'Interactive 3D force-directed graph showing ~60 Internet Autonomous Systems with BGP peering relationships.',
  });

  const legendItems: { color: string; shape: string; label: string }[] = [
    { color: '#e63333', shape: 'circle',  label: `Tier 1 Transit (${TIER_COUNTS.tier1})` },
    { color: '#3366e6', shape: 'circle',  label: `Tier 2 CDN/Regional (${TIER_COUNTS.tier2})` },
    { color: '#33cc4d', shape: 'circle',  label: `Tier 3 Access ISP (${TIER_COUNTS.tier3})` },
    { color: '#f2d933', shape: 'diamond', label: `IXP/Other (${TIER_COUNTS.ixp})` },
  ];

  const edgeLegendItems: { color: string; style: string; label: string }[] = [
    { color: '#ffffff', style: 'solid',     label: 'Tier 1 - Tier 1 peering' },
    { color: '#00cce6', style: 'solid',     label: 'Tier 1 - Tier 2 transit' },
    { color: '#808080', style: 'solid',     label: 'Tier 2 - Tier 3 transit' },
    { color: '#9999b3', style: 'dashed',    label: 'Same-tier peering' },
  ];

  return createElement('div', {
    style: {
      display: 'flex',
      height: '100%',
      padding: '16px',
      boxSizing: 'border-box',
      gap: '20px',
    },
  },
    // Left: 3D graph
    createElement('div', {
      style: { flex: '1', display: 'flex', flexDirection: 'column', minWidth: '400px' },
    },
      createElement(ForceGraph3D, {
        width: 800,
        height: 600,
        nodes: NODES,
        edges: EDGES,
        repulsionStrength: 150,
        attractionStrength: 0.08,
        damping: 0.92,
        centerGravity: 0.015,
        cameraDistance: 80,
        backgroundColor: { r: 0.04, g: 0.06, b: 0.12, a: 1 },
      }),
    ),

    // Right: sidebar
    createElement('div', {
      style: {
        width: '280px',
        flexShrink: '0',
        overflowY: 'auto',
        fontSize: '13px',
        lineHeight: '1.6',
        color: 'var(--color-text, #1f2937)',
        borderLeft: '1px solid var(--color-border, #e2e8f0)',
        paddingLeft: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      },
    },
      // Title
      createElement('h3', {
        style: { fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' },
      }, 'Internet AS Topology'),

      // Stats
      createElement('div', {
        style: {
          padding: '8px 12px',
          borderRadius: '6px',
          backgroundColor: 'var(--color-surface, #f1f5f9)',
          border: '1px solid var(--color-border, #e2e8f0)',
          fontSize: '12px',
          marginBottom: '8px',
        },
      },
        createElement('div', null,
          createElement('strong', null, 'Nodes: '), `${NODES.length}`),
        createElement('div', null,
          createElement('strong', null, 'Edges: '), `${EDGES.length}`),
        createElement('div', { style: { marginTop: '4px', fontSize: '11px', color: 'var(--color-text-muted, #64748b)' } },
          `Tier 1: ${TIER_COUNTS.tier1}  |  Tier 2: ${TIER_COUNTS.tier2}  |  Tier 3: ${TIER_COUNTS.tier3}  |  IXP: ${TIER_COUNTS.ixp}`),
      ),

      // Node legend
      createElement('h4', {
        style: { fontSize: '13px', fontWeight: '600', margin: '8px 0 4px 0' },
      }, 'Node Legend'),
      ...legendItems.map((item, i) =>
        createElement('div', {
          key: `nl${i}`,
          style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' },
        },
          createElement('div', {
            style: {
              width: '14px',
              height: '14px',
              backgroundColor: item.color,
              borderRadius: item.shape === 'circle' ? '50%' : '2px',
              border: '1px solid #475569',
              transform: item.shape === 'diamond' ? 'rotate(45deg) scale(0.8)' : 'none',
            },
          }),
          item.label,
        ),
      ),

      // Edge legend
      createElement('h4', {
        style: { fontSize: '13px', fontWeight: '600', margin: '12px 0 4px 0' },
      }, 'Edge Legend'),
      ...edgeLegendItems.map((item, i) =>
        createElement('div', {
          key: `el${i}`,
          style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' },
        },
          createElement('div', {
            style: {
              width: '24px',
              height: '3px',
              backgroundColor: item.color,
              borderStyle: item.style === 'dashed' ? 'dashed' : 'solid',
              borderWidth: item.style === 'dashed' ? '1px 0 0 0' : '0',
              borderColor: item.color,
            },
          }),
          item.label,
        ),
      ),

      // About section
      createElement('h4', {
        style: { fontSize: '13px', fontWeight: '600', margin: '16px 0 4px 0' },
      }, 'About'),

      createElement('p', { style: { fontSize: '12px', margin: '0 0 8px 0' } },
        createElement('strong', null, 'Autonomous Systems (AS)'),
        ' are independently operated networks on the Internet, each identified by a unique ASN. Every ISP, cloud provider, CDN, and large enterprise operates one or more AS.',
      ),

      createElement('p', { style: { fontSize: '12px', margin: '0 0 8px 0' } },
        createElement('strong', null, 'BGP (Border Gateway Protocol)'),
        ' is the routing protocol that glues the Internet together. ASes establish BGP peering sessions to exchange routing information. ',
        createElement('em', null, 'Transit'),
        ' relationships are paid (a customer pays a provider for global reachability), while ',
        createElement('em', null, 'peering'),
        ' relationships are typically settlement-free exchanges of traffic between networks of similar size.',
      ),

      createElement('p', { style: { fontSize: '12px', margin: '0 0 8px 0' } },
        'The Internet\'s AS topology forms a rough hierarchy: ',
        createElement('strong', null, 'Tier 1'),
        ' providers (red) have global reach through mutual peering and do not purchase transit. ',
        createElement('strong', null, 'Tier 2'),
        ' networks (blue) purchase transit from Tier 1 but also peer heavily at Internet Exchange Points. ',
        createElement('strong', null, 'Tier 3'),
        ' access networks (green) are last-mile ISPs serving end users.',
      ),

      createElement('p', { style: { fontSize: '12px', margin: '0', color: 'var(--color-text-muted, #64748b)' } },
        'This visualization shows approximately 60 real autonomous systems with simplified but representative BGP peering relationships. Drag to orbit, scroll to zoom.',
      ),
    ),
  );
}
