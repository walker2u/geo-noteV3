"use client";

import dynamic from 'next/dynamic';

// Define the dynamically imported Map component here, outside of the functional component.
// This ensures it's only defined once.
const MapWithNoSSR = dynamic(
    () => import('../components/Map'),
    {
        loading: () => <p className="flex justify-center items-center h-screen">Loading map...</p>,
        ssr: false // This is now allowed because we are in a Client Component
    }
);

export default function MapLoader() {
    return <MapWithNoSSR />;
}