import { useState } from "react";
import { Search, Grid2X2, List, ArrowLeft, ChevronDown, Tag } from "lucide-react";
import { useNotes } from "../context/NotesContext";
import NoteCard from "./NoteCard";
import TopBar from "./TopBar";
import { extractPlainText } from "../utils/textUtils";
import NoteListRow from "./NoteListRow";

const SORT_OPTIONS = [
  { id: "last-edited", label: "Last Edited" },
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
  { id: "a-z", label: "A-Z" },
  { id: "z-a", label: "Z-A" },
];

const CATEGORY_OPTIONS = [
  { id: "all", label: "All Categories" },
  { id: "STUDY", label: "Study" },
  { id: "WORK", label: "Work" },
  { id: "PERSONAL", label: "Personal" },
  { id: "RESEARCH", label: "Research" },
  { id: "UNCATEGORIZED", label: "Uncategorized" },
];

const CATEGORY_COLORS = {
  STUDY: "bg-[#1E3A3A] text-white",
  WORK: "bg-[#2A2A2A] text-white",
  PERSONAL: "bg-[#E8E3DA] text-[#4A4A4A] border border-[#C8C3BA]",
  RESEARCH: "bg-[#3A3A2A] text-white",
};

export default function FavoritesView({ onOpenNote, onBack }) {
  const { notes, favoriteNotes, trashNote, toggleFavorite } = useNotes();
  const [view, setView] = useState("grid");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("last-edited");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const asText = (value = "") => extractPlainText(value || "");

  // Get only favorite notes
  const favoriteNotesList = notes.filter((n) => favoriteNotes.includes(n.id));

  const filtered = favoriteNotesList.filter(
    (n) => {
      const noteCategory = n.category || "UNCATEGORIZED";
      const matchesSearch =
        n.title.toLowerCase().includes(query.toLowerCase()) ||
        asText(n.content).toLowerCase().includes(query.toLowerCase());
      const matchesCategory = categoryFilter === "all" || noteCategory === categoryFilter;

      return matchesSearch && matchesCategory;
    }
  );

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
      default:
        return new Date(b.date) - new Date(a.date);
    }
  });

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;

    const diffHours = Math.floor((new Date() - d) / (1000 * 60 * 60));

    if (diffHours < 24) return diffHours <= 0 ? "Just now" : `${diffHours}h ago`;

    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top bar */}
      <TopBar
        left={
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[13px] font-medium text-[#5A5854] hover:text-[#1A1A1A]"
          >
            <ArrowLeft size={14} />
            Back to Library
          </button>
        }

        center={
          <div className="flex items-center gap-2.5 bg-white/60 border rounded-xl px-3.5 py-2.5">
            <Search size={14} className="text-[#9A9690]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search favorites..."
              className="bg-transparent outline-none w-full"
            />
          </div>
        }

        right={
          <>
            <div className="flex border rounded-lg overflow-hidden bg-white/40">
              {[{ id: "grid", Icon: Grid2X2 }, { id: "list", Icon: List }].map(({ id, Icon }) => (
                <button key={id} onClick={() => setView(id)} className="p-2">
                  <Icon size={14} />
                </button>
              ))}
            </div>

            <div className="relative">
                          <button
                            onClick={() => setShowSortMenu(!showSortMenu)}
                            className="flex items-center gap-2 border border-[#D0CCC6] rounded-lg px-3 py-2 text-[12px] bg-white/40"
                          >
                            {SORT_OPTIONS.find(o => o.id === sortBy)?.label}
                            <ChevronDown size={12} />
                          </button>
            
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

          </>
        }
      />

      {/* Header */}
      <div className="px-8 pt-4 pb-3 shrink-0">
        <p className="text-[10px] text-[#9A9690] tracking-[0.1em] uppercase font-medium">
          Workspace &rsaquo; Favorites
        </p>
        <h1 className="text-[28px] font-bold text-[#1A1A1A] tracking-tight mt-1">
          Favorites
        </h1>
        <p className="text-[13px] text-[#8A8680] mt-1">
          {sortedFiltered.length} favorite notes
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {CATEGORY_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => setCategoryFilter(option.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors border ${
                categoryFilter === option.id
                  ? "bg-[#1E3A3A] text-white border-[#1E3A3A]"
                  : "bg-white/70 text-[#5A5854] border-[#D0CCC6] hover:bg-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {sortedFiltered.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-[16px] text-[#8A8680] mb-2">No favorites yet</p>
              <p className="text-[13px] text-[#9A9690]">Add notes to favorites to see them here</p>
            </div>
          </div>
        ) : view === "grid" ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {sortedFiltered.map((note) => (
              <NoteCard 
                key={note.id} 
                note={note} 
                onClick={() => onOpenNote(note)} 
                onDelete={trashNote}
                onFavorite={toggleFavorite}
                isFavorite={favoriteNotes.includes(note.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sortedFiltered.map((note) => (
              <NoteListRow
                key={note.id}
                note={note}
                previewText={asText(note.content)}
                dateText={formatDate(note.date)}
                categoryClass={CATEGORY_COLORS[note.category]}
                showFavorite
                onOpenNote={onOpenNote}
                menuItems={[
                  {
                    label: "Remove from favorites",
                    onClick: () => toggleFavorite(note.id),
                  },
                  {
                    label: "Delete",
                    onClick: () => trashNote(note.id),
                    danger: true,
                  },
                ]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
