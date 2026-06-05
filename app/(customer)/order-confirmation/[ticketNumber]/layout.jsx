// Enable dynamic routes for static export (Capacitor builds)
// This generates a fallback page that will handle all dynamic ticket numbers at runtime
export async function generateStaticParams() {
  // Return a placeholder to satisfy Next.js static export requirements
  // Real ticket numbers will be handled client-side
  return [{ ticketNumber: '_placeholder' }]
}

export default function TicketNumberLayout({ children }) {
  return children
}
