import { Inter, Manrope } from 'next/font/google';
import PropTypes from 'prop-types';
import './globals.css';
import Providers from './providers';
import ThemeProvider from '@/components/ThemeProvider';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
});

export const metadata = {
  title: 'Gadget Restore — Mobile Repair Service',
  description:
    'Book professional mobile repair. Pick up, repair at lab, delivered back. Screen, battery and more.',
  keywords: 'mobile repair, phone repair, screen replacement, battery replacement',
  authors: [{ name: 'Gadget Restore' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#050505',
};

export default function RootLayout({ children }) {
  // suppressHydrationWarning: the blocking script below stamps data-theme onto
  // <html> before React hydrates, so the client attributes intentionally differ
  // from the server markup. The flag only covers this element's own attributes,
  // not the tree beneath it.
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Apply the persisted theme before first paint to avoid a flash of the
            wrong theme. Mirrors STORAGE_KEY / DEFAULT_THEME in lib/theme.js. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('gr_theme');document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark');}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();",
          }}
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href="/images/app-icon.jpeg" type="image/jpeg" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <Providers>{children}</Providers>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
