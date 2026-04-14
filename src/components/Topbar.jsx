export default function Topbar() {
  return (
    <div className="w-full p-4 border-b border-gray-800 bg-bg flex justify-between">
      <h2 className="text-lg">Digital Atelier</h2>
      <input
        placeholder="Search ideas..."
        className="px-3 py-1 rounded-lg bg-card outline-none"
      />
    </div>
  );
}