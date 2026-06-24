import { useSignIn } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import { ParticleRing } from "@/components/features/dashboard/ParticleRing";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 18 18">
    <path
      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
      fill="#34A853"
    />
    <path
      d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 6.294C4.672 4.166 6.656 3.58 9 3.58z"
      fill="#EA4335"
    />
  </svg>
);

export const LoginPage = () => {
  const { isLoaded, signIn } = useSignIn();
  const [progress, setProgress] = useState(0.62);
  const timeRef = useRef(0);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      timeRef.current += 16;
      setProgress(0.62 + Math.sin(timeRef.current * 0.0008) * 0.22);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleGoogle = async () => {
    if (!signIn) return;
    await signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: `${window.location.origin}/sso-callback`,
      redirectUrlComplete: `${window.location.origin}/`,
    });
  };

  return (
    <div
      className="relative h-screen overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, #1a0d08 0%, #0a0705 65%, #B6B9FE 100%)",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <ParticleRing
          progress={progress}
          color="#B6B9FE"
          inactiveColor="#3a3732"
          size={280}
        />
      </div>

      <div className="absolute z-10 left-0 right-0 top-[72%] flex flex-col items-center px-8">
        <h1
          className="text-3xl text-white tracking-tight"
          style={{
            fontFamily: "'Bitcount Prop Single', cursive",
            fontWeight: 300,
          }}
        >
          reteP
        </h1>
        <p className="text-white/50 text-sm mt-1.5 font-medium">
          紀錄你的飲食習慣
        </p>

        <button
          onClick={handleGoogle}
          disabled={!isLoaded}
          className="mt-6 w-fit flex items-center justify-center gap-3 py-3.5 px-8 bg-white rounded-full text-sm font-semibold text-gray-800 shadow-sm hover:shadow-md active:scale-95 transition-all disabled:opacity-50"
        >
          <GoogleIcon />
          使用 Google 登入
        </button>
      </div>
    </div>
  );
};
