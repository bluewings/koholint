import * as React from 'react';
import useLeaflet from './useLeaflet';
import styles from './Map.module.scss';

function Map(props: any) {
  const L = useLeaflet();

  console.log(L);
  return (
    <div className={styles.root}>
      {/* <h1>koholint</h1> */}
    </div>
  );
}

export default Map;
