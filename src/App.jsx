import { useState } from "react";
import Sidebar from "./components/Sidebar";
import LibraryView from "./components/LibraryView";
import EditorView from "./components/EditorView";
import TrashView from "./components/TrashView";
import FavoritesView from "./components/FavoritesView";
import { NotesProvider } from "./context/NotesContext";

export default function App() {
  const [currentView, setCurrentView] = useState("library"); // "library" | "editor" | "favorites" | "trash" | "settings"
  const [activeNote, setActiveNote] = useState(null);

  const openNote = (note) => {
    setActiveNote(note);
    setCurrentView("editor");
  };

  const newNote = () => {
    setActiveNote(null);
    setCurrentView("editor");
  };

  const goToLibrary = () => {
    setCurrentView("library");
    setActiveNote(null);
  };

  const navigate = (view) => {
    setCurrentView(view);
    setActiveNote(null);
  };

  return (
    <NotesProvider>
      <div className="flex h-screen bg-[#F0EDE8] font-sans overflow-hidden">
        <Sidebar onNewNote={newNote} onNavigate={navigate} currentView={currentView} />
        <main className="flex-1 overflow-hidden">
          {currentView === "library" ? (
            <LibraryView onOpenNote={openNote} onNewNote={newNote} />
          ) : currentView === "editor" ? (
            <EditorView note={activeNote} onBack={goToLibrary} />
          ) : currentView === "favorites" ? (
            <FavoritesView onOpenNote={openNote} onBack={goToLibrary} />
          ) : currentView === "trash" ? (
            <TrashView onBack={goToLibrary} />
          ) : currentView === "settings" ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-[#8A8680]">Settings view - Coming soon</p>
            </div>
          ) : (
            <LibraryView onOpenNote={openNote} onNewNote={newNote} />
          )}
        </main>
      </div>
    </NotesProvider>
  );
}