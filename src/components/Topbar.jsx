export default function TopBar({ left, center, right }) {
  return (
    <div className="relative z-40 flex items-center justify-between px-8 pt-5 pb-4 shrink-0 overflow-visible bg-[#F8F5F0] border-b border-[#E5DFD7] shadow-sm">
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