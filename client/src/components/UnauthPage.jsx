export default function UnauthPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mx-auto w-full max-w-md rounded-xl border border-teal-200 bg-white p-8 shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white text-2xl font-bold">!</div>
        <h1 className="text-xl font-semibold text-slate-900 mb-2">Authentication Required</h1>
        <p className="text-sm text-slate-600 mb-6">You must sign in before you can view this page. Please login to continue.</p>
        <a
          href="/login"
          className="inline-flex items-center justify-center rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
}
