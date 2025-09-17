import "./globals.css";

// MODIFIED: Add the viewport object to metadata
export const metadata = {
  title: "EchoMap",
  description: "A map-based notes application",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1, // Optional: prevents zooming on the UI itself
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}