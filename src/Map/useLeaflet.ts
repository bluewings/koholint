import { useEffect, useState, useMemo } from 'react';
import { Map, MapOptions, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface InitializeMap {
  (element: string | HTMLElement, options?: MapOptions): Map;
}

interface LatLngBounds {
  new (southWest: LatLngExpression, northEast: LatLngExpression): any;
}

export type Leaflet = {
  map: InitializeMap;
  LatLngBounds: LatLngBounds;
  Control: any;
  TileLayer: any;
};

const LEAFLET_URI =
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.5.1/leaflet.js';

const loadScript = (src: string) => {
  return new Promise((resolve, reject) => {
    const head = document.head || document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.onload = resolve;
    script.onerror = () =>
      reject(new Error(`failed to load: ${src.split('/').pop()}`));
    head.appendChild(script);
  });
};

function useLeaflet(): Leaflet | undefined {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      // @ts-ignore
      if (!window.L) {
        await loadScript(LEAFLET_URI);
      }
      setReady(true);
    })();
  }, []);

  let L: any;
  try {
    // @ts-ignore
    L = window.L;
  } catch (err) {
    /* ignore */
  }

  return useMemo(() => (ready && L ? L : undefined), [ready, L]);
}

export default useLeaflet;
