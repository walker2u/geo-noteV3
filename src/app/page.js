import { useEffect } from 'react';
import MapLoader from '../components/MapLoader';
import { sdk } from '@farcaster/miniapp-sdk';

export default function Home() {

  useEffect(() => {
    sdk.actions.ready();
  }, []);
  return (
    <main>
      <MapLoader />
    </main>
  );
}