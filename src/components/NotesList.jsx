import NoteCard from "./NoteCard";

export default function NotesList({ notes, selectedId, setSelectedId }) {
  return (
    <div className="w-80 border-r border-gray-800 p-4 overflow-y-auto bg-bg">
      <h2 className="mb-4 text-lg">Recent Notes</h2>

      <div className="space-y-3">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            isActive={selectedId === note.id}
            onClick={() => setSelectedId(note.id)}
          />
        ))}
      </div>
    </div>
  );
}