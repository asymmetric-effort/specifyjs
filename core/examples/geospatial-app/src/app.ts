import { createElement } from '../../../src/index';
import { useState } from '../../../src/hooks/index';
import { createRoot } from '../../../src/dom/create-root';
import { USStateMap } from '../../../../components/viz/us-state-map/src/index';
import { EarthGlobe } from '../../../../components/viz/earth-globe/src/index';
import { CA } from '../../../../components/viz/us-state-map/states/CA';
import { TX } from '../../../../components/viz/us-state-map/states/TX';
import { NY } from '../../../../components/viz/us-state-map/states/NY';

function GeospatialApp() {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [clickedState, setClickedState] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [clickedCountry, setClickedCountry] = useState<string | null>(null);

  return createElement(
    'div',
    { id: 'geospatial-app' },
    createElement('h1', null, 'Geospatial Maps'),

    // -- US State Map section --
    createElement(
      'section',
      { 'data-testid': 'us-map-section' },
      createElement('h2', null, 'US State Map'),
      createElement(USStateMap, {
        stateColors: {
          CA: '#3b82f6',
          TX: '#f97316',
          NY: '#a855f7',
        },
        defaultColor: '#D0D0D0',
        strokeColor: '#FFFFFF',
        strokeWidth: 1,
        hoverColor: '#FFD700',
        onStateHover: setHoveredState,
        onStateClick: setClickedState,
        title: 'US States Test Map',
      }),
      createElement(
        'div',
        { className: 'status', 'data-testid': 'hovered-state' },
        hoveredState ? `Hovered: ${hoveredState}` : 'No state hovered',
      ),
      createElement(
        'div',
        { className: 'status', 'data-testid': 'clicked-state' },
        clickedState ? `Clicked: ${clickedState}` : 'No state clicked',
      ),
    ),

    // -- Earth Globe section --
    createElement(
      'section',
      { 'data-testid': 'globe-section' },
      createElement('h2', null, 'Earth Globe'),
      createElement(EarthGlobe, {
        width: 350,
        height: 350,
        rotation: { longitude: -95, latitude: 35 },
        fillColor: '#22c55e',
        oceanColor: '#3b82f6',
        strokeColor: '#ffffff',
        strokeWidth: 0.5,
        showGraticule: true,
        interactive: true,
        hoverColor: '#16a34a',
        onCountryHover: setHoveredCountry,
        onCountryClick: setClickedCountry,
        title: 'Earth Globe Test',
      }),
      createElement(
        'div',
        { className: 'status', 'data-testid': 'hovered-country' },
        hoveredCountry ? `Hovered: ${hoveredCountry}` : 'No country hovered',
      ),
      createElement(
        'div',
        { className: 'status', 'data-testid': 'clicked-country' },
        clickedCountry ? `Clicked: ${clickedCountry}` : 'No country clicked',
      ),
    ),

    // -- Individual State Components section --
    createElement(
      'section',
      { 'data-testid': 'individual-states-section' },
      createElement('h2', null, 'Individual States'),
      createElement(
        'div',
        { style: { display: 'flex', gap: '16px', flexWrap: 'wrap' } },
        createElement(
          'div',
          { 'data-testid': 'state-ca' },
          createElement(CA, {
            width: 150,
            fillColor: '#3b82f6',
            title: 'California',
          }),
        ),
        createElement(
          'div',
          { 'data-testid': 'state-tx' },
          createElement(TX, {
            width: 150,
            fillColor: '#f97316',
            title: 'Texas',
          }),
        ),
        createElement(
          'div',
          { 'data-testid': 'state-ny' },
          createElement(NY, {
            width: 150,
            fillColor: '#a855f7',
            title: 'New York',
          }),
        ),
      ),
    ),
  );
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(createElement(GeospatialApp, null));
}
