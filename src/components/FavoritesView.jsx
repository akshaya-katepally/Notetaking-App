import { useState } from "react";
import { Search, Grid2X2, List, ArrowLeft, FileText } from "lucide-react";
import { useNotes } from "../context/NotesContext";
import NoteCard from "./NoteCard";

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

  // Get only favorite notes
  const favoriteNotesList = notes.filter((n) => favoriteNotes.includes(n.id));

  const filtered = favoriteNotesList.filter(
    (n) =>
      n.title.toLowerCase().includes(query.toLowerCase()) ||
      n.content.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 pt-5 pb-0 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[13px] font-medium text-[#5A5854] hover:text-[#1A1A1A] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Library
        </button>

        <div className="flex-1 max-w-md mx-4">
          <div className="flex items-center gap-2.5 bg-white/60 border border-[#D0CCC6] rounded-xl px-3.5 py-2.5">
            <Search size={14} className="text-[#9A9690] shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search favorites..."
              className="bg-transparent text-[13px] text-[#1A1A1A] placeholder-[#9A9690] outline-none w-full"
            />
          </div>
        </div>

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
      </div>

      {/* Header */}
      <div className="px-8 pt-4 pb-3 shrink-0">
        <p className="text-[10px] text-[#9A9690] tracking-[0.1em] uppercase font-medium">
          Workspace &rsaquo; Favorites
        </p>
        <h1 className="text-[28px] font-bold text-[#1A1A1A] tracking-tight mt-1">
          Favorites
        </h1>
        <p className="text-[13px] text-[#8A8680] mt-1">
          {filtered.length} favorite notes
        </p>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {filtered.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-[16px] text-[#8A8680] mb-2">No favorites yet</p>
              <p className="text-[13px] text-[#9A9690]">Add notes to favorites to see them here</p>
            </div>
          </div>
        ) : view === "grid" ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filtered.map((note) => (
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
            {filtered.map((note) => (
              <div
                key={note.id}
                className="flex items-center gap-4 bg-white/60 border border-[#D9D6CF] rounded-xl px-4 py-3 text-left hover:bg-white/90 transition-colors group relative"
              >
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
                    <span className="text-[11px] text-[#9A9690]">{note.date}</span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
