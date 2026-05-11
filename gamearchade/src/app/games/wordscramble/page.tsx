"use client";

import WordScrambleGamePage from "@/components/games/wordscramble/WordScrambleGamePage";

export default function WordScramblePage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/pages/auth');
    return null;
  }

  return <WordScrambleGamePage />;
}