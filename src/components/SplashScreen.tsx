import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

const GabonFlag = () => (
  <svg viewBox="0 0 60 40" className="w-12 h-8 md:w-14 md:h-9 lg:w-16 lg:h-10" aria-label="Drapeau du Gabon">
    <rect width="60" height="13.33" fill="#009E49" />
    <rect y="13.33" width="60" height="13.33" fill="#FCD116" />
    <rect y="26.67" width="60" height="13.33" fill="#3A75C4" />
  </svg>
);

const GeometricDecorations = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    preserveAspectRatio="xMidYMax slice"
    viewBox="0 0 800 240"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Left branch */}
    <path
      d="M 0 120 Q 80 180 160 200"
      fill="none"
      stroke="hsl(15 75% 55% / 0.35)"
      strokeWidth="1.5"
    />
    <path
      d="M 40 80 Q 120 140 200 180"
      fill="none"
      stroke="hsl(15 75% 55% / 0.25)"
      strokeWidth="1"
    />
    <path
      d="M 80 40 Q 160 100 240 160"
      fill="none"
      stroke="hsl(15 75% 55% / 0.2)"
      strokeWidth="0.8"
    />

    {/* Right branch */}
    <path
      d="M 800 120 Q 720 180 640 200"
      fill="none"
      stroke="hsl(15 75% 55% / 0.35)"
      strokeWidth="1.5"
    />
    <path
      d="M 760 80 Q 680 140 600 180"
      fill="none"
      stroke="hsl(15 75% 55% / 0.25)"
      strokeWidth="1"
    />
    <path
      d="M 720 40 Q 640 100 560 160"
      fill="none"
      stroke="hsl(15 75% 55% / 0.2)"
      strokeWidth="0.8"
    />

    {/* Circles */}
    <circle cx="60" cy="180" r="8" fill="hsl(15 75% 55% / 0.5)" />
    <circle cx="100" cy="200" r="5" fill="hsl(15 75% 55% / 0.35)" />
    <circle cx="140" cy="175" r="4" fill="hsl(15 75% 55% / 0.6)" />
    <circle cx="740" cy="180" r="8" fill="hsl(15 75% 55% / 0.5)" />
    <circle cx="700" cy="200" r="5" fill="hsl(15 75% 55% / 0.35)" />
    <circle cx="660" cy="175" r="4" fill="hsl(15 75% 55% / 0.6)" />

    {/* Small dots */}
    <circle cx="30" cy="150" r="2" fill="hsl(15 75% 55% / 0.4)" />
    <circle cx="50" cy="220" r="2.5" fill="hsl(15 75% 55% / 0.3)" />
    <circle cx="770" cy="150" r="2" fill="hsl(15 75% 55% / 0.4)" />
    <circle cx="750" cy="220" r="2.5" fill="hsl(15 75% 55% / 0.3)" />

    {/* Triangles */}
    <polygon points="180,210 190,225 170,225" fill="hsl(15 75% 55% / 0.45)" />
    <polygon points="620,210 630,225 610,225" fill="hsl(15 75% 55% / 0.45)" />
    <polygon points="200,140 210,155 190,155" fill="hsl(15 75% 55% / 0.3)" />
    <polygon points="600,140 610,155 590,155" fill="hsl(15 75% 55% / 0.3)" />

    {/* Squares */}
    <rect x="220" y="200" width="12" height="12" fill="hsl(15 75% 55% / 0.35)" transform="rotate(15 226 206)" />
    <rect x="568" y="200" width="12" height="12" fill="hsl(15 75% 55% / 0.35)" transform="rotate(-15 574 206)" />

    {/* Mountain-like shape */}
    <polygon points="680,120 700,100 720,120" fill="none" stroke="hsl(15 75% 55% / 0.4)" strokeWidth="1.5" />
  </svg>
);

export const SplashScreen = ({ onComplete, duration = 2500 }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-between overflow-hidden transition-opacity duration-700 ease-out"
      style={{ backgroundColor: "#EDE4D8" }}
      aria-hidden="true"
    >
      {/* Top label */}
      <div className="pt-12 md:pt-16 lg:pt-20 text-center px-6">
        <p className="text-[#D97745] text-sm md:text-base lg:text-lg tracking-[0.15em] uppercase font-medium">
          langue nzébi officiel
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 w-full max-w-md">
        <div className="mb-6 md:mb-8">
          <BookOpen
            className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 text-[#D97745]"
            strokeWidth={1.5}
          />
        </div>

        <h1 className="text-[#D97745] text-3xl md:text-4xl lg:text-5xl font-semibold tracking-wide mb-6">
          Dictionnaire inzèbi
        </h1>

        <div className="mb-5">
          <GabonFlag />
        </div>

        <div className="w-24 md:w-32 lg:w-40 h-1 rounded-full bg-[#D97745]" />
      </div>

      {/* Bottom decorative area */}
      <div className="relative w-full h-48 md:h-56 lg:h-64">
        <GeometricDecorations />
        <div className="absolute bottom-6 md:bottom-8 left-0 right-0 text-center px-6">
          <p className="text-[#D97745] text-xs md:text-sm tracking-[0.2em] uppercase">
            langue nzébi officiel
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
