import { Providers } from "./providers";
import "./globals.css";

export const metadata = {
  title: "ShopEase — Premium Curated Goods",
  description:
    "Curated collections selected with perfection. Unlock lightning-fast express delivery, dual OTP verification security, and secure checkout.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
