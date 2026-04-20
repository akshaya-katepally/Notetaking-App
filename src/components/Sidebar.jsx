import { BookOpen, Trash2, Settings, Plus, Heart } from "lucide-react";

const NAV_ITEMS = [
  { id: "library", label: "Library", icon: BookOpen },
  { id: "favorites", label: "Favorites", icon: Heart },
  { id: "trash", label: "Trash", icon: Trash2 },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ onNewNote, onNavigate, currentView }) {
  return (
    <aside className="w-[210px] flex flex-col h-full bg-[#ECEAE4] border-r border-[#D9D6CF] shrink-0">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#1E3A3A] rounded-md flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-[#A8C5BB] rounded-sm" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#1A1A1A] tracking-tight leading-none">la mémoire</p>
            <p className="text-[9px] text-[#8A8680] tracking-[0.08em] uppercase mt-0.5">Personal Workspace</p>
          </div>
        </div>
      </div>

      {/* New Note Button */}
      <div className="px-4 mb-5">
        <button
          onClick={onNewNote}
          className="w-full flex items-center justify-center gap-2 bg-[#1E3A3A] hover:bg-[#2A4A4A] text-white text-[13px] font-medium py-2.5 rounded-lg transition-colors duration-150"
        >
          <Plus size={14} strokeWidth={2.5} />
          New Note
        </button>
      </div>

      {/* Nav */}
      <nav className="px-3 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors duration-100 w-full text-left ${
              currentView === id
                ? "bg-[#D9D6CF] text-[#1A1A1A] font-medium"
                : "text-[#5A5854] hover:bg-[#D9D6CF]/60 hover:text-[#1A1A1A]"
            }`}
          >
            <Icon size={15} strokeWidth={1.8} />
            {label}
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="mt-auto px-4 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#4A3728] flex items-center justify-center text-white text-[10px] font-bold">
            AR
          </div>
          <div>
            <p className="text-[12px] font-medium text-[#1A1A1A]">Alex Rivera</p>
            <p className="text-[10px] text-[#8A8680]">Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}