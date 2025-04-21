export default function ConfirmEmailPage() {
  return (
    <div className="container max-w-md mx-auto min-h-screen flex items-center justify-center p-4 sm:p-0">
      <div className="w-full py-8 text-center">
        <h1 className="text-2xl font-bold text-primary mb-4">Check Your Email</h1>
        <p className="text-gray-600 mb-4">
          We've sent you a confirmation email. Please check your inbox and click the link to verify your account.
        </p>
        <p className="text-sm text-gray-400">
          Didn't receive the email?{" "}
          <a href="/auth/signup" className="text-primary hover:underline">
            Try signing up again
          </a>
        </p>
      </div>
    </div>
  );
} 