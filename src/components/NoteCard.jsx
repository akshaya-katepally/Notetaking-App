import { useState } from "react";
import { Trash2, MoreVertical, Pin, Copy, Share2, Heart } from "lucide-react";

const CATEGORY_COLORS = {
  STUDY: "bg-[#1E3A3A] text-white",
  WORK: "bg-[#2A2A2A] text-[#C8D8D4]",
  PERSONAL: "bg-[#E8E3DA] text-[#4A4A4A] border border-[#C8C3BA]",
  RESEARCH: "bg-[#1A2010] text-[#C8D4B0]",
};

export default function NoteCard({ note, onClick, onDelete, onPin, isPinned, onFavorite, isFavorite }) {
  const { title, content, category, tags, date, image, pages, size, emoji, avatar, featured } = note;
  const [showMenu, setShowMenu] = useState(false);

  // Format date and time
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "Recently created";
    if (dateStr === "Just now") return "Just now";
    
    try {
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) {
        return dateStr; // Return original if parsing fails
      }
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const isToday = dateObj.toDateString() === today.toDateString();
      const isYesterday = dateObj.toDateString() === yesterday.toDateString();
      
      const time = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
      
      if (isToday) {
        return `Today at ${time}`;
      } else if (isYesterday) {
        return `Yesterday at ${time}`;
      } else {
        const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return `${dateStr} at ${time}`;
      }
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="break-inside-avoid w-full text-left bg-white/50 border border-[#D9D6CF] rounded-2xl overflow-visible hover:bg-white/80 hover:border-[#C8C3BA] hover:shadow-sm transition-all duration-150 group mb-4 relative">
      {/* Three-dot menu button */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 z-20 transition-opacity">
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm hover:shadow-md"
          >
            <MoreVertical size={14} className="text-[#5A5854]" />
          </button>
          
          {/* Dropdown menu */}
          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-[#D0CCC6] rounded-lg shadow-lg z-50 animate-slide-in-up max-h-64 overflow-y-auto">
              {onPin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPin(note.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#F5F5F5] transition-colors flex items-center gap-2 text-[13px] text-[#2A2A2A] border-b border-[#E8E5DF]"
                >
                  <Pin size={14} className={isPinned ? "text-[#1E3A3A] fill-current" : "text-[#9A9690]"} />
                  <span>{isPinned ? "Unpin note" : "Pin note"}</span>
                </button>
              )}

              {onFavorite && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFavorite(note.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#F5F5F5] transition-colors flex items-center gap-2 text-[13px] text-[#2A2A2A] border-b border-[#E8E5DF]"
                >
                  <Heart size={14} className={isFavorite ? "text-[#E91E63] fill-current" : "text-[#9A9690]"} />
                  <span>{isFavorite ? "Remove from favorites" : "Add to favorites"}</span>
                </button>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(`${title}\n\n${content}`);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-[#F5F5F5] transition-colors flex items-center gap-2 text-[13px] text-[#2A2A2A] border-b border-[#E8E5DF]"
              >
                <Copy size={14} className="text-[#9A9690]" />
                <span>Copy note</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  // Share functionality can be implemented here
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-[#F5F5F5] transition-colors flex items-center gap-2 text-[13px] text-[#2A2A2A] border-b border-[#E8E5DF]"
              >
                <Share2 size={14} className="text-[#9A9690]" />
                <span>Share</span>
              </button>
              
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(note.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#FFEBEE] transition-colors flex items-center gap-2 text-[13px] text-[#C62828]"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onClick}
        className="w-full text-left block"
      >
        {image && (
          <div className="w-full aspect-video overflow-hidden">
            <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
          </div>
        )}

        {emoji && (
          <div className="flex justify-center pt-6 pb-2">
            <div className="w-12 h-12 bg-[#F0EDE8] border border-[#D9D6CF] rounded-full flex items-center justify-center text-2xl">
              {emoji}
            </div>
          </div>
        )}

        <div className="p-4">
          {/* Pin indicator */}
          {isPinned && (
            <div className="flex items-center gap-1 mb-2">
              <Pin size={12} className="text-[#1E3A3A] fill-current" />
              <span className="text-[10px] font-semibold text-[#1E3A3A] tracking-widest">PINNED</span>
            </div>
          )}

          {/* Category & Date */}
          {(category || date) && (
            <div className="flex items-center justify-between mb-2.5">
              {category && (
                <span className={`text-[9px] uppercase tracking-[0.1em] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[category] || "bg-gray-200 text-gray-600"}`}>
                  {category}
                </span>
              )}
              {date && <span className="text-[10px] text-[#9A9690] ml-auto">{formatDateTime(date)}</span>}
            </div>
          )}

          {/* Title */}
          <h3 className={`font-bold text-[#1A1A1A] leading-snug tracking-tight ${featured ? "text-[20px] mb-2" : "text-[14px] mb-1.5"} ${emoji ? "text-center" : ""}`}>
            {title}
          </h3>

          {/* Content preview */}
          {content && (
            <p className={`text-[#6A6864] leading-relaxed ${featured ? "text-[13px]" : "text-[12px]"} ${emoji ? "text-center text-[11px]" : ""} line-clamp-3`}>
              {content}
            </p>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {tags.map((tag) => (
                <span key={tag} className="text-[10px] text-[#6A6864] bg-[#E8E5DF] px-2 py-0.5 rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* File meta */}
          {(pages || size) && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E8E5DF]">
              {pages && <span className="text-[11px] text-[#9A9690]">{pages}</span>}
              {size && <span className="text-[11px] text-[#9A9690]">{size}</span>}
            </div>
          )}

          {/* Avatar */}
          {avatar && (
            <div className="flex justify-end mt-3">
              <div className="w-6 h-6 rounded-full bg-[#4A3728] flex items-center justify-center text-white text-[9px] font-bold">
                {avatar}
              </div>
            </div>
          )}

          {/* Open note button for emoji cards */}
          {emoji && (
            <div className="mt-3 flex justify-center">
              <span className="text-[11px] text-[#5A5854] border border-[#C8C3BA] rounded-lg px-3 py-1 bg-[#F0EDE8]">Open note</span>
            </div>
          )}
        </div>
      </button>
    </div>
  );
}