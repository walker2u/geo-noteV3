import "./globals.css";

export async function generateMetadata() {
  return {
    title: "GeoNote",
    description: "A map-based notes application",
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 1, // Optional: prevents zooming on the UI itself
    },
    other: {
      'fc:miniapp': JSON.stringify({
        version: 'next',
        imageUrl: 'https://geo-note-v3.vercel.app/icon.png',
        button: {
          title: `Open GeoNote`,
          action: {
            type: 'launch_miniapp',
            name: 'GeoNote',
            url: 'https://geo-note-v3.vercel.app',
            splashImageUrl: 'https://geo-note-v3.vercel.app/uni-bg.jpg',
            splashBackgroundColor: '#000000',
          },
        },
      }),
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}