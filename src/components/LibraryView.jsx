import { useState } from "react";
import { Search, Grid2X2, List, ChevronDown } from "lucide-react";
import { useNotes } from "../context/NotesContext";
import NoteCard from "./NoteCard";
import NoteListRow from "./NoteListRow";
import TopBar from "./TopBar";
import { extractPlainText } from "../utils/textUtils";

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

const CATEGORY_OPTIONS = [
  { id: "all", label: "All Categories" },
  { id: "STUDY", label: "Study" },
  { id: "WORK", label: "Work" },
  { id: "PERSONAL", label: "Personal" },
  { id: "RESEARCH", label: "Research" },
  { id: "UNCATEGORIZED", label: "Uncategorized" },
];

export default function LibraryView({ onOpenNote }) {
  const { notes, trashNote, pinnedNotes, togglePin, favoriteNotes, toggleFavorite } = useNotes();

  const [view, setView] = useState("grid");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("last-edited");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const asText = (value = "") => extractPlainText(value || "");

  // 🔹 FILTER
  const filtered = notes.filter(
    (n) => {
      const noteCategory = n.category || "UNCATEGORIZED";
      const matchesSearch =
        n.title.toLowerCase().includes(query.toLowerCase()) ||
        asText(n.content).toLowerCase().includes(query.toLowerCase());
      const matchesCategory = categoryFilter === "all" || noteCategory === categoryFilter;

      return matchesSearch && matchesCategory;
    }
  );

  // 🔹 SORT
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

  // 🔹 PIN LOGIC
  const pinnedFilteredNotes = sortedFiltered.filter((n) => pinnedNotes.includes(n.id));
  const unpinnedFilteredNotes = sortedFiltered.filter((n) => !pinnedNotes.includes(n.id));
  const orderedNotes = [...pinnedFilteredNotes, ...unpinnedFilteredNotes];

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;

    const diffHours = Math.floor((new Date() - d) / (1000 * 60 * 60));

    if (diffHours < 24) return diffHours <= 0 ? "Just now" : `${diffHours}h ago`;

    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* 🔹 TOPBAR */}
      <TopBar
        left={<div />}

        center={
          <div className="flex items-center gap-2.5 bg-white/60 border rounded-xl px-3.5 py-2.5">
            <Search size={14} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search library..."
              className="bg-transparent outline-none w-full"
            />
          </div>
        }

        right={
          <>
            {/* View */}
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
          Workspace &rsaquo; Library
        </p>
        <h1 className="text-[28px] font-bold text-[#1A1A1A] tracking-tight mt-1">Collection</h1>
        <p className="text-[13px] text-[#8A8680] mt-1">
          {sortedFiltered.length} notes
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

      {/* 🔹 CONTENT */}
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
            {orderedNotes.map((note) => (
              <NoteListRow
                key={note.id}
                note={note}
                previewText={asText(note.content)}
                dateText={formatDate(note.date)}
                categoryClass={CATEGORY_COLORS[note.category]}
                showPinned={pinnedNotes.includes(note.id)}
                showFavorite={favoriteNotes.includes(note.id)}
                onOpenNote={onOpenNote}
                menuItems={[
                  {
                    label: pinnedNotes.includes(note.id) ? "Unpin" : "Pin",
                    onClick: () => togglePin(note.id),
                  },
                  {
                    label: favoriteNotes.includes(note.id) ? "Unfavorite" : "Favorite",
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
