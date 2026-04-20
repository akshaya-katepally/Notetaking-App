export default function TopBar({ left, center, right }) {
  return (
    <div className="flex items-center justify-between px-8 pt-5 pb-0 shrink-0">
      
      {/* Left */}
      <div className="min-w-[120px] flex items-center">
        {left}
      </div>

      {/* Center */}
      <div className="flex-1 max-w-md mx-4">
        {center}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 min-w-[120px] justify-end">
        {right}
      </div>

    </div>
  );
}