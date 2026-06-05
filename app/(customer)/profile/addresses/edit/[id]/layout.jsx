// Enable dynamic routes for static export (Capacitor builds)
// This generates a fallback page that will handle all dynamic address IDs at runtime
export async function generateStaticParams() {
  // Return a placeholder to satisfy Next.js static export requirements
  // Real address IDs will be handled client-side
  return [{ id: '_placeholder' }]
}

export default function AddressIdLayout({ children }) {
  return children
}
