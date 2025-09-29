import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="/" className="flex items-center font-bold text-lg">
          Omni Agency
        </Link>
        <nav className="ml-auto flex items-center gap-4">
          <Link href="/auth/login" className="text-sm font-medium hover:underline underline-offset-4">
            Login
          </Link>
          <Link href="/auth/register">
            <Button>Get Started</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Athlete Representation Platform
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                    The secure, multi-tenant SaaS platform built for athlete-representation agencies. Manage your athletes, track their performance, and grow your business.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link href="/auth/register">
                    <Button className="px-8" size="lg">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button variant="outline" className="px-8" size="lg">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[400px] w-full rounded-lg bg-gradient-to-br from-indigo-500 to-blue-700 p-8 flex items-center justify-center text-white text-2xl font-bold">
                  Athlete Management Simplified
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Features
                </h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Everything you need to manage your athletes and grow your agency.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
              {[
                {
                  title: "Multi-tenant Workspaces",
                  description: "Private workspace per agency with granular role permissions."
                },
                {
                  title: "Fast Data Entry",
                  description: "Quick access to contacts, communications, health records, and more."
                },
                {
                  title: "Rich Attachments",
                  description: "Secure storage for documents, imaging, and searchable logs."
                },
                {
                  title: "Tiered Grading",
                  description: "Comprehensive grading systems across customizable dashboards."
                },
                {
                  title: "Secure Permissions",
                  description: "Row-level security ensures data is only accessible to authorized users."
                },
                {
                  title: "Performance Tracking",
                  description: "Track NIL and NFL value, awards, and athlete development."
                }
              ].map((feature, index) => (
                <div key={index} className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t px-4 md:px-6">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Omni Agency. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
