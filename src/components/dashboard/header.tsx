'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { useTheme } from 'next-themes';

interface HeaderProps {
  user: User;
  newsPanelOpen?: boolean;
  newsPanelWidth?: number;
}

export default function Header({ user, newsPanelOpen = true, newsPanelWidth = 400 }: HeaderProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header className={
      `bg-white dark:bg-gray-950 border-b px-4 py-3 flex items-center justify-between transition-all duration-300 ease-in-out` +
      ` mr-[${newsPanelWidth}px]`
    }>
      <h1 className="uppercase text-3xl font-extralight">OMNI<span className='font-extrabold'>AGENCY</span></h1>
      <div className="flex items-center gap-2 md:hidden">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <line x1="3" x2="21" y1="6" y2="6"></line>
            <line x1="3" x2="21" y1="12" y2="12"></line>
            <line x1="3" x2="21" y1="18" y2="18"></line>
          </svg>
          <span className="sr-only">Toggle Menu</span>
        </button>
      </div>
      <div className="flex-1 flex items-center justify-end gap-4">
        {/* Theme toggle button next to user name */}
        <button
          type="button"
          aria-label="Toggle theme"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            // Sun icon for light mode
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            // Moon icon for dark mode
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
            </svg>
          )}
        </button>
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 text-sm font-medium"
          >
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
              <span className="text-xs font-semibold">
                {user.email?.[0].toUpperCase() || 'U'}
              </span>
            </div>
            <span className="hidden md:inline-block">{user.email}</span>
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-900 rounded-md shadow-lg border z-10">
              {/* <Link
                href="/dashboard/settings/profile"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsProfileOpen(false)}
              >
                Profile Settings
              </Link>
              <Link
                href="/dashboard/settings/organization"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsProfileOpen(false)}
              >
                Organization Settings
              </Link> */}
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
