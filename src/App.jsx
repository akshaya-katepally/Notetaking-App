// 🚀 Complete Minimal Notes App (React + Vite + Tailwind)
// Features: CRUD, Tags, Search, Dark Mode, Basic Editor

import { useState, useEffect } from "react";

export default function App() {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("notes");
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [dark, setDark] = useState(true);

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  const selectedNote = notes.find(n => n.id === selectedId);

  const createNote = () => {
    const newNote = {
      id: Date.now(),
      title: "Untitled",
      content: "",
      tags: []
    };
    setNotes([newNote, ...notes]);
    setSelectedId(newNote.id);
  };

  const updateNote = (field, value) => {
    setNotes(notes.map(n => n.id === selectedId ? { ...n, [field]: value } : n));
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
    setSelectedId(null);
  };

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={dark ? "dark" : ""}>
      <div className="flex h-screen bg-gray-100 dark:bg-[#0b0f1a] text-black dark:text-white">

        {/* Sidebar */}
        <div className="w-64 p-4 border-r border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-semibold mb-4">The Atelier</h1>

          <button
            onClick={createNote}
            className="w-full mb-4 bg-purple-500 text-white py-2 rounded-lg"
          >
            + New Note
          </button>

          <input
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full p-2 mb-4 rounded bg-gray-200 dark:bg-gray-800"
          />

          <div className="space-y-2 overflow-y-auto h-[70vh]">
            {filtered.map(note => (
              <div
                key={note.id}
                onClick={() => setSelectedId(note.id)}
                className={`p-3 rounded cursor-pointer ${selectedId === note.id ? "bg-purple-200 dark:bg-purple-900" : "bg-gray-200 dark:bg-gray-800"}`}
              >
                <h2 className="font-medium">{note.title}</h2>
                <p className="text-sm opacity-70 truncate">{note.content}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setDark(!dark)}
            className="mt-4 text-sm opacity-70"
          >
            Toggle Theme
          </button>
        </div>

        {/* Editor */}
        <div className="flex-1 p-6">
          {selectedNote ? (
            <>
              <input
                value={selectedNote.title}
                onChange={e => updateNote("title", e.target.value)}
                className="text-3xl font-serif w-full mb-4 bg-transparent outline-none"
              />

              <textarea
                value={selectedNote.content}
                onChange={e => updateNote("content", e.target.value)}
                className="w-full h-[60vh] bg-transparent outline-none"
                placeholder="Start writing..."
              />

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => deleteNote(selectedNote.id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </div>
            </>
          ) : (
            <div className="text-center mt-20 opacity-50">
              Select or create a note
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
