export function Footer() {
  return (
    <footer className="text-center mt-12 py-8 border-t border-gray-800 text-gray-500 text-sm">
      <p>
        Built with Next.js & shadcn/ui • Powered by FastAPI • View on{" "}
        <a
          href="https://github.com/imrahnf/steam-vault-frontend"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#e94560] hover:underline"
        >
          GitHub
        </a>
      </p>
    </footer>
  );
}
