import { useState } from "react";
import { Search, Grid2X2, List, ArrowLeft, RotateCcw, Trash2, ChevronDown, Tag } from "lucide-react";
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

export default function TrashView({ onBack }) {
  const { trashedNotes, restoreNote, permanentlyDeleteNote, emptyTrash } = useNotes();
  const [view, setView] = useState("grid");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("last-edited");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const asText = (value = "") => extractPlainText(value || "");

  const filtered = trashedNotes.filter(
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

  const handleDeleteAll = () => {
    if (trashedNotes.length === 0) return;

    const confirmed = window.confirm("Delete all notes in Trash permanently?");
    if (!confirmed) return;

    emptyTrash();
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
              placeholder="Search trash..."
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
                onClick={() => {
                  setShowSortMenu(!showSortMenu);
                  setShowCategoryMenu(false);
                }}
                className="flex items-center gap-2 border border-[#D0CCC6] rounded-lg px-3 py-2 text-[12px] bg-white/40"
              >
                {SORT_OPTIONS.find((o) => o.id === sortBy)?.label}
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
      <div className="px-8 pt-4 pb-3 shrink-0 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] text-[#9A9690] tracking-[0.1em] uppercase font-medium">
            Workspace &rsaquo; Trash
          </p>
          <h1 className="text-[28px] font-bold text-[#1A1A1A] tracking-tight mt-1">
            Recently Deleted
          </h1>
          <p className="text-[13px] text-[#8A8680] mt-1">
            {trashedNotes.length} notes in trash
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

        <button
          onClick={handleDeleteAll}
          disabled={trashedNotes.length === 0}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E6B7BC] bg-[#FFEBEE] text-[#B71C1C] text-[12px] font-semibold hover:bg-[#FFE0E4] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 size={14} />
          Delete All
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {sortedFiltered.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-[16px] text-[#8A8680] mb-2">No notes in trash</p>
              <p className="text-[13px] text-[#9A9690]">Deleted notes will appear here</p>
            </div>
          </div>
        ) : view === "grid" ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {sortedFiltered.map((note) => (
              <div key={note.id} className="break-inside-avoid group relative mb-4">
                <NoteCard note={note} hideActions onClick={() => {}} />

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 z-20 transition-opacity">
                  <button
                    onClick={() => restoreNote(note.id)}
                    className="p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm hover:shadow-md"
                    title="Restore note"
                  >
                    <RotateCcw size={14} className="text-[#1E3A3A]" />
                  </button>
                  <button
                    onClick={() => permanentlyDeleteNote(note.id)}
                    className="p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm hover:shadow-md"
                    title="Delete permanently"
                  >
                    <Trash2 size={14} className="text-[#C62828]" />
                  </button>
                </div>
              </div>
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
                onOpenNote={() => {}}
                menuItems={[
                  {
                    label: "Restore",
                    onClick: () => restoreNote(note.id),
                  },
                  {
                    label: "Delete permanently",
                    onClick: () => permanentlyDeleteNote(note.id),
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