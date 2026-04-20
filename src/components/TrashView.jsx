import { useState } from "react";
import { Search, Grid2X2, List, ArrowLeft, RotateCcw, Trash2 } from "lucide-react";
import { useNotes } from "../context/NotesContext";
import NoteCard from "./NoteCard";
import TopBar from "./TopBar";
import { extractPlainText } from "../utils/textUtils";

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
  const asText = (value = "") => extractPlainText(value || "");

  const filtered = trashedNotes.filter(
    (n) =>
      n.title.toLowerCase().includes(query.toLowerCase()) ||
      asText(n.content).toLowerCase().includes(query.toLowerCase())
  );

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
          <div className="flex items-center gap-2.5 bg-white/60 border border-[#D0CCC6] rounded-xl px-3.5 py-2.5">
            <Search size={14} className="text-[#9A9690]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search trash..."
              className="bg-transparent text-[13px] outline-none w-full"
            />
          </div>
        }

        right={
          <div className="flex items-center border border-[#D0CCC6] rounded-lg overflow-hidden bg-white/40">
            {[{ id: "grid", Icon: Grid2X2 }, { id: "list", Icon: List }].map(({ id, Icon }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`p-2 ${
                  view === id ? "bg-white shadow-sm" : "hover:bg-[#E5E2DC]"
                }`}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
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
            {filtered.map((note) => (
              <div
                key={note.id}
                className="flex items-center gap-4 bg-white/60 border border-[#D9D6CF] rounded-xl px-4 py-3 group relative hover:bg-white/90 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#1A1A1A] truncate">{note.title}</p>
                  <p className="text-[11px] text-[#8A8680] truncate">{asText(note.content)}</p>
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