import "./globals.css";

export const metadata = {
  title: "Geo Notes App",
  description: "A map-based notes application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}