import { useState } from "react";
import { Search, Grid2X2, List, ArrowLeft, RotateCcw, Trash2 } from "lucide-react";
import { useNotes } from "../context/NotesContext";
import NoteCard from "./NoteCard";

const CATEGORY_COLORS = {
  STUDY: "bg-[#1E3A3A] text-white",
  WORK: "bg-[#2A2A2A] text-white",
  PERSONAL: "bg-[#E8E3DA] text-[#4A4A4A] border border-[#C8C3BA]",
  RESEARCH: "bg-[#3A3A2A] text-white",
};

export default function TrashView({ onBack }) {
  const { trashedNotes, restoreNote, permanentlyDeleteNote } = useNotes();
  const [view, setView] = useState("grid");
  const [query, setQuery] = useState("");

  const filtered = trashedNotes.filter(
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
              placeholder="Search trash..."
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
          Workspace &rsaquo; Trash
        </p>
        <h1 className="text-[28px] font-bold text-[#1A1A1A] tracking-tight mt-1">
          Recently Deleted
        </h1>
        <p className="text-[13px] text-[#8A8680] mt-1">
          {trashedNotes.length} notes in trash
        </p>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {filtered.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-[16px] text-[#8A8680] mb-2">No notes in trash</p>
              <p className="text-[13px] text-[#9A9690]">Deleted notes will appear here</p>
            </div>
          </div>
        ) : view === "grid" ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filtered.map((note) => (
              <div key={note.id} className="break-inside-avoid w-full text-left bg-white/50 border border-[#D9D6CF] rounded-2xl overflow-hidden hover:bg-white/80 hover:border-[#C8C3BA] hover:shadow-sm transition-all duration-150 group mb-4 relative">
                {/* Action buttons */}
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

                <div className="p-4">
                  {/* Category & Date */}
                  {(note.category || note.date) && (
                    <div className="flex items-center justify-between mb-2.5">
                      {note.category && (
                        <span className={`text-[9px] uppercase tracking-[0.1em] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[note.category] || "bg-gray-200 text-gray-600"}`}>
                          {note.category}
                        </span>
                      )}
                      {note.date && <span className="text-[10px] text-[#9A9690] ml-auto">{note.date}</span>}
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="font-bold text-[14px] text-[#1A1A1A] leading-snug tracking-tight mb-1.5">
                    {note.title}
                  </h3>

                  {/* Content preview */}
                  {note.content && (
                    <p className="text-[12px] text-[#6A6864] leading-relaxed line-clamp-3">
                      {note.content}
                    </p>
                  )}

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {note.tags.map((tag) => (
                        <span key={tag} className="text-[10px] text-[#6A6864] bg-[#E8E5DF] px-2 py-0.5 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action buttons below content */}
                  <div className="mt-3 pt-3 border-t border-[#E8E5DF] flex gap-2">
                    <button
                      onClick={() => restoreNote(note.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#1E3A3A] hover:bg-[#2A4A4A] text-white text-[11px] font-medium rounded transition-colors"
                    >
                      <RotateCcw size={12} />
                      Restore
                    </button>
                    <button
                      onClick={() => permanentlyDeleteNote(note.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#FFEBEE] hover:bg-[#FFCDD2] text-[#C62828] text-[11px] font-medium rounded transition-colors"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((note) => (
              <div
                key={note.id}
                className="flex items-center gap-4 bg-white/60 border border-[#D9D6CF] rounded-xl px-4 py-3 group relative hover:bg-white/90 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#1A1A1A] truncate">{note.title}</p>
                  <p className="text-[11px] text-[#8A8680] truncate">{note.content}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[note.category] || "bg-gray-200 text-gray-600"}`}>
                    {note.category}
                  </span>
                  <span className="text-[11px] text-[#9A9690]">{note.date}</span>
                  <button
                    onClick={() => restoreNote(note.id)}
                    className="ml-2 flex items-center gap-1 px-3 py-1.5 bg-[#1E3A3A] hover:bg-[#2A4A4A] text-white text-[11px] font-medium rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="Restore note"
                  >
                    <RotateCcw size={12} />
                    Restore
                  </button>
                  <button
                    onClick={() => permanentlyDeleteNote(note.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#FFEBEE] hover:bg-[#FFCDD2] text-[#C62828] text-[11px] font-medium rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete permanently"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}