export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-6 sm:grid-cols-2 items-center">
        <div className="text-sm text-gray-600">
          © {new Date().getFullYear()} Nomadia — Making solo backpacking accessible and free.
        </div>
        <nav className="flex gap-4 justify-start sm:justify-end text-sm text-gray-600">
          <a href="#about" className="hover:text-gray-900">About</a>
          <a href="#support" className="hover:text-gray-900">Contact</a>
          <a href="#support" className="hover:text-gray-900">Support Nomadia</a>
          <a href="#" className="hover:text-gray-900">Privacy</a>
        </nav>
      </div>
    </footer>
  );
}
