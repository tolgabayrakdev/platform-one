"use client";

import { useRouter } from "next/navigation";

export default function ProfileBackButton() {
  const router = useRouter();

  function handleBack() {
    router.push("/profile");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleBack();
    }
  }

  return (
    <button
      onClick={handleBack}
      onKeyDown={handleKeyDown}
      aria-label="Profile geri dön"
      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md px-2 py-1 min-h-[44px] min-w-[44px]"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
      <span className="sr-only">Profile geri dön</span>
    </button>
  );
}
