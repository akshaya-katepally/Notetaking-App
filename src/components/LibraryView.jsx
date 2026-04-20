import { useState } from "react";
import { Search, SlidersHorizontal, Grid2X2, List, ChevronDown, FileText, MoreVertical, Pin, Copy, Share2, Trash2, Heart } from "lucide-react";
import { useNotes } from "../context/NotesContext";
import NoteCard from "./NoteCard";

const CATEGORY_COLORS = {
  STUDY: "bg-[#1E3A3A] text-white",
  WORK: "bg-[#2A2A2A] text-white",
  PERSONAL: "bg-[#E8E3DA] text-[#4A4A4A] border border-[#C8C3BA]",
  RESEARCH: "bg-[#3A3A2A] text-white",
};

const SORT_OPTIONS = [
  { id: "last-edited", label: "Last Edited" },
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
  { id: "a-z", label: "A-Z" },
  { id: "z-a", label: "Z-A" },
];

export default function LibraryView({ onOpenNote }) {
  const { notes, trashNote, pinnedNotes, togglePin, favoriteNotes, toggleFavorite } = useNotes();
  const [view, setView] = useState("grid");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("last-edited");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(query.toLowerCase()) ||
      n.content.toLowerCase().includes(query.toLowerCase())
  );

  // Sort notes based on selected option
  const sortedFiltered = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.date) - new Date(a.date);
      case "oldest":
        return new Date(a.date) - new Date(b.date);
      case "a-z":
        return a.title.localeCompare(b.title);
      case "z-a":
        return b.title.localeCompare(a.title);
      case "last-edited":
      default:
        return new Date(b.date) - new Date(a.date);
    }
  });

  // Separate pinned and unpinned notes
  const pinnedFilteredNotes = sortedFiltered.filter((n) => pinnedNotes.includes(n.id));
  const unpinnedFilteredNotes = sortedFiltered.filter((n) => !pinnedNotes.includes(n.id));
  const orderedNotes = [...pinnedFilteredNotes, ...unpinnedFilteredNotes];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 pt-5 pb-0 shrink-0">
        <div className="flex-1 max-w-md">
          <div className="flex items-center gap-2.5 bg-white/60 border border-[#D0CCC6] rounded-xl px-3.5 py-2.5">
            <Search size={14} className="text-[#9A9690] shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your monolith..."
              className="bg-transparent text-[13px] text-[#1A1A1A] placeholder-[#9A9690] outline-none w-full"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button className="p-2 rounded-lg hover:bg-[#D9D6CF] transition-colors">
            <SlidersHorizontal size={16} className="text-[#5A5854]" />
          </button>
          <div className="w-px h-5 bg-[#D0CCC6]" />
          <div className="flex items-center border border-[#D0CCC6] rounded-lg overflow-hidden bg-white/40">
            {[
              { id: "grid", Icon: Grid2X2 },
              { id: "list", Icon: List },
            ].map(({ id, Icon }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`p-2 transition-colors ${view === id ? "bg-white shadow-sm" : "hover:bg-[#E5E2DC]"}`}
              >
                <Icon size={14} className={view === id ? "text-[#1A1A1A]" : "text-[#8A8680]"} />
              </button>
            ))}
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1.5 border border-[#D0CCC6] rounded-lg px-3 py-2 text-[12px] text-[#5A5854] bg-white/40 hover:bg-white/70 transition-colors"
            >
              {SORT_OPTIONS.find(o => o.id === sortBy)?.label || "Last Edited"}
              <ChevronDown size={12} />
            </button>
            
            {/* Sort dropdown menu */}
            {showSortMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-[#D0CCC6] rounded-lg shadow-lg z-30">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSortBy(option.id);
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 hover:bg-[#F5F5F5] transition-colors text-[13px] ${
                      sortBy === option.id ? "bg-[#E5E2DC] text-[#1A1A1A] font-medium" : "text-[#2A2A2A]"
                    } ${option.id === SORT_OPTIONS[SORT_OPTIONS.length - 1].id ? "rounded-b-lg" : "border-b border-[#E8E5DF]"}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="px-8 pt-4 pb-3 shrink-0">
        <p className="text-[10px] text-[#9A9690] tracking-[0.1em] uppercase font-medium">
          Workspace &rsaquo; Library
        </p>
        <h1 className="text-[28px] font-bold text-[#1A1A1A] tracking-tight mt-1">Collection</h1>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {view === "grid" ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {orderedNotes.map((note) => (
              <NoteCard 
                key={note.id} 
                note={note} 
                onClick={() => onOpenNote(note)} 
                onDelete={trashNote}
                onPin={togglePin}
                isPinned={pinnedNotes.includes(note.id)}
                onFavorite={toggleFavorite}
                isFavorite={favoriteNotes.includes(note.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {orderedNotes.map((note) => {
              const [showListMenu, setShowListMenu] = useState(false);
              
              const formatDateTime = (dateStr) => {
                if (!dateStr) return "Recently created";
                if (dateStr === "Just now") return "Just now";
                
                try {
                  const dateObj = new Date(dateStr);
                  if (isNaN(dateObj.getTime())) {
                    return dateStr;
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
                <div
                  key={note.id}
                  className="flex items-center gap-4 bg-white/60 border border-[#D9D6CF] rounded-xl px-4 py-3 text-left hover:bg-white/90 transition-colors group relative"
                >
                  {pinnedNotes.includes(note.id) && (
                    <Pin size={14} className="text-[#1E3A3A] fill-current shrink-0" />
                  )}
                  <button
                    onClick={() => onOpenNote(note)}
                    className="flex items-center gap-4 flex-1"
                  >
                    <FileText size={16} className="text-[#9A9690] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#1A1A1A] truncate">{note.title}</p>
                      <p className="text-[11px] text-[#8A8680] truncate">{note.content}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[note.category] || "bg-gray-200 text-gray-600"}`}>
                        {note.category}
                      </span>
                      <span className="text-[10px] text-[#9A9690]">{formatDateTime(note.date)}</span>
                    </div>
                  </button>
                  
                  {/* Three-dot menu for list view */}
                  <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowListMenu(!showListMenu);
                      }}
                      className="p-1.5 rounded hover:bg-[#E5E2DC] transition-colors"
                    >
                      <MoreVertical size={14} className="text-[#5A5854]" />
                    </button>
                    
                    {showListMenu && (
                      <div className="absolute right-0 mt-1 w-48 bg-white border border-[#D0CCC6] rounded-lg shadow-lg z-50 animate-slide-in-up max-h-64 overflow-y-auto">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePin(note.id);
                            setShowListMenu(false);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-[#F5F5F5] transition-colors flex items-center gap-2 text-[13px] text-[#2A2A2A] border-b border-[#E8E5DF]"
                        >
                          <Pin size={14} className={pinnedNotes.includes(note.id) ? "text-[#1E3A3A] fill-current" : "text-[#9A9690]"} />
                          <span>{pinnedNotes.includes(note.id) ? "Unpin note" : "Pin note"}</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(note.id);
                            setShowListMenu(false);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-[#F5F5F5] transition-colors flex items-center gap-2 text-[13px] text-[#2A2A2A] border-b border-[#E8E5DF]"
                        >
                          <Heart size={14} className={favoriteNotes.includes(note.id) ? "text-[#E91E63] fill-current" : "text-[#9A9690]"} />
                          <span>{favoriteNotes.includes(note.id) ? "Remove from favorites" : "Add to favorites"}</span>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
                            setShowListMenu(false);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-[#F5F5F5] transition-colors flex items-center gap-2 text-[13px] text-[#2A2A2A] border-b border-[#E8E5DF]"
                        >
                          <Copy size={14} className="text-[#9A9690]" />
                          <span>Copy note</span>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowListMenu(false);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-[#F5F5F5] transition-colors flex items-center gap-2 text-[13px] text-[#2A2A2A] border-b border-[#E8E5DF]"
                        >
                          <Share2 size={14} className="text-[#9A9690]" />
                          <span>Share</span>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            trashNote(note.id);
                            setShowListMenu(false);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-[#FFEBEE] transition-colors flex items-center gap-2 text-[13px] text-[#C62828]"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[12px] text-[#9A9690] mb-3">Showing {orderedNotes.length} of {notes.length} notes</p>
          <button className="px-6 py-2.5 border border-[#C8C3BA] rounded-xl text-[13px] text-[#5A5854] hover:bg-[#E5E2DC] transition-colors bg-white/40">
            Load more archives
          </button>
        </div>
      </div>
    </div>
  );
}