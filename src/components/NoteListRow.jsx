import { useState } from "react";
import { FileText, MoreVertical, Pin, Heart } from "lucide-react";

export default function NoteListRow({
  note,
  previewText,
  dateText,
  categoryClass,
  showPinned = false,
  showFavorite = false,
  menuItems = [],
  onOpenNote,
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex items-center gap-4 bg-white/60 border border-[#D9D6CF] rounded-xl px-4 py-3 hover:bg-white/90 transition-colors group relative">
      <button
        onClick={() => onOpenNote?.(note)}
        className="flex items-center gap-4 flex-1 min-w-0 text-left"
      >
        <div className="shrink-0 relative w-6 h-6 flex items-center justify-center">
          <FileText size={16} className="text-[#9A9690]" />

          {(showPinned || showFavorite) && (
            <div className="absolute -top-1.5 -right-1.5 flex items-center gap-0.5">
              {showPinned && (
                <span className="w-3.5 h-3.5 rounded-full bg-[#E8F1EE] border border-[#D0E2DB] flex items-center justify-center">
                  <Pin size={8} className="text-[#1E3A3A] fill-current" />
                </span>
              )}
              {showFavorite && (
                <span className="w-3.5 h-3.5 rounded-full bg-[#FDEAF1] border border-[#F8C9DD] flex items-center justify-center">
                  <Heart size={8} className="text-[#E91E63] fill-current" />
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#1A1A1A] truncate">{note.title || "Untitled"}</p>
          <p className="text-[11px] text-[#8A8680] truncate">{previewText || "No content"}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full font-medium ${categoryClass || "bg-gray-200 text-gray-600"}`}>
            {note.category || "UNCATEGORIZED"}
          </span>
          <span className="text-[11px] text-[#9A9690]">{dateText}</span>
        </div>
      </button>

      <div className="relative">
        <button
          onClick={(event) => {
            event.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1.5 rounded hover:bg-[#E5E2DC] transition-colors opacity-0 group-hover:opacity-100"
          title="More options"
        >
          <MoreVertical size={14} className="text-[#5A5854]" />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-1 w-44 bg-white border border-[#D0CCC6] rounded-lg shadow-lg z-[9999]">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={(event) => {
                  event.stopPropagation();
                  item.onClick?.(note);
                  setShowMenu(false);
                }}
                className={`block w-full px-3 py-2 text-left text-[13px] ${item.danger ? "text-red-500 hover:bg-[#FFEBEE]" : "hover:bg-[#F5F5F5]"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
