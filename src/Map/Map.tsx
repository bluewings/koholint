import * as React from 'react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  SyntheticEvent,
} from 'react';
import useLeaflet, { Leaflet } from './useLeaflet';
import useContainerRect from './useContainerRect';
import styles from './Map.module.scss';
import deepzoom from './map.json';

type IProps = {
  L: Leaflet;
  deepzoom: any;
};

function MapInner({ L, deepzoom }: IProps) {
  const root = useRef<any>();
  const container = useRef<any>();

  // get container size info
  const rect: any = useContainerRect(root, ['width', 'height']);
  const [width, height] = useMemo(
    () =>
      rect && rect.width && rect.height ? [rect.width, rect.height] : [0, 0],
    [rect],
  );

  const defaultZoom: any = useMemo(() => {
    if (deepzoom && width && height) {
      const { zoom } = getSizeInfo(deepzoom, { width, height });
      return deepzoom.maxZoom - zoom;
    }
    return undefined;
  }, [width, height, deepzoom]);

  console.log({ defaultZoom });

  const fileURI = 'https://bluewings.github.io/koholint/assets';

  useEffect(() => {
    // initialize leaflet viewer
    if (defaultZoom && container.current) {
      const {
        width,
        height,
        minZoom,
        maxZoom,
        tileImg,
        tileSizes,
      }: any = deepzoom;

      container.current.innerHTML = '';
      const map = L.map(container.current, {
        maxZoom: Math.max(defaultZoom, maxZoom),
        minZoom: Math.max(defaultZoom, minZoom),
        zoomControl: false,
        attributionControl: false,
        zoomSnap: 0,
      });

      // define the area of the map to display based on the original width
      const southWest = map.unproject([0, height], map.getMaxZoom());
      const northEast = map.unproject([width, 0], map.getMaxZoom());
      const bounds = new L.LatLngBounds(southWest, northEast);

      map.setMaxBounds(bounds);
      map.setView([northEast.lng / 2, southWest.lat / 2], defaultZoom);

      // map.addEventListener('movestart', moveStart);
      // map.addEventListener('moveend', moveEnd);

      // add zoom control
      new L.Control.Zoom({ position: 'bottomright' }).addTo(map);

      // apply a custom tile layer.
      const MapTileLayer = L.TileLayer.extend({
        createTile: function(coords: any, done: Function) {
          const { z, x, y } = coords;
          // do not provide an image beyond the supported range
          if (!tileSizes[z]) {
            return document.createElement('div');
          }
          const [maxX, maxY] = tileSizes[z];
          // do not provide an image if there are no tiles in that area
          if (x < 0 || y < 0 || maxX < x || maxY < y) {
            return document.createElement('div');
          }

          let tileSrc = `${fileURI}/${tileImg}`
          .replace(/{z}/, z)
          .replace(/{x}/, x)
          .replace(/{y}/, y);

          if (x === 0 || y === 0 || x === maxX - 1 || y === maxY - 1) {
            console.log({x, y})
            tileSrc = tileSrc.replace(/\.jpeg$/, '.png');
          }
          var tile = document.createElement('img');
          tile.onload = () => {
            tile.style.width = 'auto';
            tile.style.height = 'auto';
            done(null, tile);
          };
          tile.src = tileSrc;
          return tile;
        },
      });

      new MapTileLayer({
        minZoom,
        maxZoom,
        tms: false,
        continuousWorld: 'false',
        noWrap: false,
        defaultRadius: 1,
      }).addTo(map);

      return () => {
        try {
          map.remove();
        } catch (e) {
          /* ignore */
        }
      };
    }
    return undefined;
  }, [fileURI, deepzoom, defaultZoom, width, height]);

  return (
    <div>
      <div ref={root}>
        <div ref={container} style={{ width: 400, height: 400 }}></div>
      </div>
    </div>
  );
}

function Map(props: any) {
  const L = useLeaflet();
  return (
    <div className={styles.root}>
      {L ? <MapInner L={L} deepzoom={deepzoom} /> : null}
    </div>
  );
}

const getSizeInfo = (
  deepzoomSize: any,
  containerSize: any,
  zoomSnap = false,
) => {
  const { width: deepzoomW, height: deepzoomH } = deepzoomSize;
  const { width: containerW, height: containerH } = containerSize;
  const r1 = containerW / containerH;
  const r2 = deepzoomW / deepzoomH;
  let scale = r1 > r2 ? deepzoomH / containerH : deepzoomW / containerW;
  let zoom = Math.log(scale) / Math.log(2);
  if (zoomSnap) {
    zoom = Math.ceil(zoom);
    scale = Math.pow(2, zoom);
  }
  const width = Math.ceil(deepzoomW / scale);
  const height = Math.ceil(deepzoomH / scale);
  return {
    scale,
    zoom,
    style: {
      width,
      height,
      top: (containerH - height) / 2,
      left: (containerW - width) / 2,
    },
  };
};

export default Map;
