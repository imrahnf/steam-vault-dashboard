import { Gamepad2 } from 'lucide-react';

export function Header() {
  return (
    <header className="text-center mb-12">
      <h1 className="text-5xl font-bold mb-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-transparent bg-clip-text inline-block">
        SteamVault
      </h1>
      <p className="text-gray-500 text-lg mb-4">Steam Gaming Analytics Demo</p>
      
      <div className="inline-flex items-center gap-3 bg-white/50 backdrop-blur-sm border border-indigo-100 rounded-lg px-6 py-4 text-sm mt-6 shadow-sm">
        <Gamepad2 className="w-6 h-6 text-indigo-500" />
        <span className="text-gray-600">
          This demo uses sample data as of <strong className="text-indigo-600">November 15, 2025</strong>. All analytics reflect activity up to that date.
        </span>
      </div>
    </header>
  );
}
