export default function NoteCard({ note, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl cursor-pointer transition ${
        isActive
            ? "bg-accent/20"
            : "bg-card hover:bg-gray-700"
        }`}
    >
      <h3 className="font-medium">{note.title || "Untitled"}</h3>
      <p className="text-sm opacity-70 truncate">
        {note.content}
      </p>
    </div>
  );
}