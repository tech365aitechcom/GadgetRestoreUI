// Enable dynamic routes for static export (Capacitor builds)
// This generates fallback pages for common brands
export async function generateStaticParams() {
  // Generate pages for common brands, client-side will handle others
  return [
    { brand: 'apple' },
    { brand: 'samsung' },
    { brand: '_placeholder' }
  ]
}

export default function BrandLayout({ children }) {
  return children
}
