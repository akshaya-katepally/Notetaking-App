export default function Sidebar({ createNote, search, setSearch }) {
  return (
    <div className="w-64 p-5 border-r border-gray-800 bg-bg">
      <h1 className="text-xl font-semibold mb-6">The Atelier</h1>

      <button
        onClick={createNote}
        className="w-full mb-5 bg-accent text-white py-2 rounded-xl"
      >
        + New Note
      </button>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
        className="w-full p-2 rounded-lg bg-card outline-none"
      />
    </div>
  );
}
