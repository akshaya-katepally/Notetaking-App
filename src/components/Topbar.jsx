// export default function Topbar() {
//   return (
//     <div className="w-full p-4 border-b border-gray-800 bg-bg flex justify-between">
//       <h2 className="text-lg">Digital Atelier</h2>
//       <input
//         placeholder="Search ideas..."
//         className="px-3 py-1 rounded-lg bg-card outline-none"
//       />
//     </div>
//   );
// }

import { Sun, Moon } from "lucide-react";

export default function Topbar({ dark, setDark }) {
  return (
    <div className="w-full p-4 border-b border-gray-800 bg-bg flex justify-between items-center">
      <h2 className="text-lg font-medium">Digital Atelier</h2>

      <button
        onClick={() => setDark(!dark)}
        className="p-2 rounded-lg bg-card hover:scale-105 transition"
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  );
}