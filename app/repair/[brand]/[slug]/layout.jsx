// Enable dynamic routes for static export (Capacitor builds)
// This generates fallback pages for common device models and repair types
export async function generateStaticParams() {
  // Generate pages for common combinations, client-side will handle others
  return [
    { slug: '_placeholder' }
  ]
}

export default function SlugLayout({ children }) {
  return children
}
