import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-bold">Check your email</h1>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            We've sent you an email with a link to verify your account. Please check your inbox and follow the instructions.
          </p>
        </div>
        <div className="mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Didn't receive an email? Check your spam folder or try again.
          </p>
          <div className="mt-4">
            <Link href="/auth/login">
              <Button variant="outline" className="w-full">
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
