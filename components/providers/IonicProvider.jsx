'use client';

import { setupIonicReact } from '@ionic/react';
import { useEffect, useState } from 'react';

// Core CSS required for Ionic components to work properly
import '@ionic/react/css/core.css';

// Basic CSS for apps built with Ionic
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

// Optional CSS utils that can be commented out
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic theme variables (Optional, we are primarily using Tailwind)
 * Uncomment if you want Ionic's default dark mode behavior:
 * import '@ionic/react/css/palettes/dark.always.css';
 * import '@ionic/react/css/palettes/dark.class.css';
 * import '@ionic/react/css/palettes/dark.system.css';
 */

setupIonicReact({
  mode: 'ios', // Enforce iOS style across all platforms for a consistent premium look
});

import { IonApp } from '@ionic/react';

export function IonicProvider({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <IonApp>{children}</IonApp>;
}
