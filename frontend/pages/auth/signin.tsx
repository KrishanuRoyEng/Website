import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Github, ArrowRight } from 'lucide-react';

export default function SignIn() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="text-3xl font-bold inline-block mb-4">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              CodeClub
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">
            Join our community and showcase your projects
          </p>
        </div>

        {/* Card */}
        <div className="card p-8 mb-6">
          {/* GitHub Sign In */}
          <button
            onClick={() => signIn('github')}
            className="btn-primary w-full flex items-center justify-center gap-3 mb-6"
          >
            <Github size={20} />
            Sign in with GitHub
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">or</span>
            </div>
          </div>

          {/* Info */}
          <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-white mb-2">GitHub Authentication</h3>
            <p className="text-sm text-slate-400">
              We use GitHub OAuth for secure authentication. Your GitHub projects will be automatically fetched and displayed on your profile.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white mb-3">Benefits of signing up:</h3>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-primary font-bold">✓</span>
              </div>
              <span className="text-sm text-slate-300">Showcase your GitHub projects</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-primary font-bold">✓</span>
              </div>
              <span className="text-sm text-slate-300">Create a professional profile</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-primary font-bold">✓</span>
              </div>
              <span className="text-sm text-slate-300">Connect with other developers</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-primary font-bold">✓</span>
              </div>
              <span className="text-sm text-slate-300">Participate in community events</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm">
          By signing in, you agree to our{' '}
          <a href="#" className="text-primary hover:text-secondary transition-colors">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary hover:text-secondary transition-colors">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
