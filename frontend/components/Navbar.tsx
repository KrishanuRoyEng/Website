import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Menu, X, LogOut, LogIn } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  return (
    <nav className="bg-slate-900/50 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              CodeClub
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/members"
              className="text-slate-300 hover:text-primary transition-colors"
            >
              Members
            </Link>
            <Link
              href="/projects"
              className="text-slate-300 hover:text-primary transition-colors"
            >
              Projects
            </Link>
            <Link
              href="/events"
              className="text-slate-300 hover:text-primary transition-colors"
            >
              Events
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-slate-300 hover:text-accent transition-colors"
              >
                Admin
              </Link>
            )}
          </div>

          {/* Auth Button */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-4">
                <Link
                  href={`/profile/${(session.user as any)?.id}`}
                  className="flex items-center gap-2 text-slate-300 hover:text-primary transition-colors"
                >
                  <img
                    src={session.user?.image || '/avatar.png'}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                  {session.user?.name}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="btn-secondary flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('github')}
                className="btn-primary flex items-center gap-2"
              >
                <LogIn size={16} />
                Sign In with GitHub
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-slate-800 rounded-lg"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-3 border-t border-slate-700 pt-4">
            <Link
              href="/members"
              className="block text-slate-300 hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Members
            </Link>
            <Link
              href="/projects"
              className="block text-slate-300 hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Projects
            </Link>
            <Link
              href="/events"
              className="block text-slate-300 hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Events
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="block text-slate-300 hover:text-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Admin
              </Link>
            )}
            {session ? (
              <button
                onClick={() => {
                  signOut();
                  setIsOpen(false);
                }}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => {
                  signIn('github');
                  setIsOpen(false);
                }}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <LogIn size={16} />
                Sign In
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
