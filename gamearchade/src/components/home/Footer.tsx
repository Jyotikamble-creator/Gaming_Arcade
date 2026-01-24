// Footer component for the home page
// Displays copyright information and site links.

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="container mx-auto px-4 py-8 border-t border-gray-700 mt-16 text-slate-400">
      <div className="text-center text-sm mt-8">
        &copy; {currentYear} GameArchade. All Rights Reserved.
      </div>
    </footer>
  );
}
