export default function Editor({ note, updateNote, deleteNote }) {
  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center opacity-50">
        Select a note
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-bg">
      <input
        value={note.title}
        onChange={(e) => updateNote("title", e.target.value)}
        className="text-4xl font-serif w-full mb-6 bg-transparent outline-none"
      />

      <textarea
        value={note.content}
        onChange={(e) => updateNote("content", e.target.value)}
        className="w-full h-[60vh] bg-transparent outline-none text-lg"
        placeholder="Start writing..."
      />

      <button
        onClick={() => deleteNote(note.id)}
        className="mt-6 text-red-400"
      >
        Delete
      </button>
    </div>
  );
}