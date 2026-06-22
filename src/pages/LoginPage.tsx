import { useSignIn } from "@clerk/clerk-react";
import { useEffect, useRef } from "react";

const COLS = 27;
const ROWS = 27;
const CENTER_C = (COLS - 1) / 2;
const CENTER_R = (ROWS - 1) / 2;

function lerpColor(a: string, b: string, amount: number) {
  const ah = parseInt(a.replace("#", ""), 16);
  const bh = parseInt(b.replace("#", ""), 16);
  const ar = ah >> 16,
    ag = (ah >> 8) & 0xff,
    ab = ah & 0xff;
  const br = bh >> 16,
    bg = (bh >> 8) & 0xff,
    bb = bh & 0xff;
  const rr = ar + amount * (br - ar);
  const rg = ag + amount * (bg - ag);
  const rb = ab + amount * (bb - ab);
  return (
    "#" + (((1 << 24) + (rr << 16) + (rg << 8) + rb) | 0).toString(16).slice(1)
  );
}

const CircleGridCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    let width = 0,
      height = 0,
      spacing = 0,
      offsetX = 0,
      offsetY = 0;
    let animId = 0,
      time = 0;

    type Node = {
      c: number;
      r: number;
      x: number;
      y: number;
      radius: number;
      targetRadius: number;
      maxR: number;
      minR: number;
    };
    const nodes: Node[] = [];

    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        nodes.push({
          c,
          r,
          x: 0,
          y: 0,
          radius: 0,
          targetRadius: 0,
          maxR: 0,
          minR: 0,
        });

    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
      spacing = Math.min(width / (COLS + 1), height / (ROWS + 1));
      offsetX = (width - (COLS - 1) * spacing) / 2;
      offsetY = (height - (ROWS - 1) * spacing) / 2;
      nodes.forEach((n) => {
        n.x = offsetX + n.c * spacing;
        n.y = offsetY + n.r * spacing;
        n.maxR = spacing * 0.35;
        n.minR = spacing * 0.08;
      });
    };

    const update = () => {
      const progress = 0.62 + Math.sin(time * 0.0008) * 0.22;
      const innerR = 1.8;
      const maxDisplayR = 12.0;
      const waveR = innerR + progress * (maxDisplayR - innerR);
      const edgeW = 2.5;
      nodes.forEach((n) => {
        const dist = Math.hypot(n.c - CENTER_C, n.r - CENTER_R);
        if (dist < innerR || dist > maxDisplayR) {
          n.targetRadius = 0;
        } else {
          const outerFade = Math.max(0, Math.min(1, (maxDisplayR - dist) / 1.8));
          const innerFade = Math.max(0, Math.min(1, (dist - innerR) / 1.0));
          const influence = Math.max(0, Math.min(1, 1 - (dist - waveR) / edgeW));
          const base = n.minR * outerFade * innerFade;
          n.targetRadius = base + (n.maxR - base) * influence * innerFade;
        }
        n.radius = Math.max(0, n.radius + (n.targetRadius - n.radius) * 0.2);
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const clipR = Math.min(width, height) * 0.48;
      ctx.save();
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, clipR, 0, Math.PI * 2);
      ctx.clip();

      nodes.forEach((n) => {
        if (n.radius < 0.3) return;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        const ratio = Math.max(
          0,
          Math.min(1, (n.radius - n.minR * 0.5) / (n.maxR - n.minR * 0.5)),
        );
        ctx.fillStyle = lerpColor("#c5c0b8", "#ff6b4a", ratio);
        ctx.fill();
      });

      ctx.restore();
    };

    const loop = () => {
      time += 16;
      update();
      draw();
      animId = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

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

  const handleGoogle = async () => {
    if (!signIn) return;
    await signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: `${window.location.origin}/sso-callback`,
      redirectUrlComplete: "/",
    });
  };

  return (
    <div className="relative h-screen overflow-hidden bg-[#050505]">
      <CircleGridCanvas />

      <div className="absolute z-10 left-0 right-0 top-[72%] flex flex-col items-center px-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">reteP</h1>
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
