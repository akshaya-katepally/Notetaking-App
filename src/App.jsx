import { useState, useEffect } from "react";
import Sidebar from "./components/sidebar";
import NotesList from "./components/NotesList";
import Editor from "./components/Editor";
import Topbar from "./components/Topbar";

export default function App() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, [dark]);

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("notes");
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  const selectedNote = notes.find((n) => n.id === selectedId);

  const createNote = () => {
    const newNote = {
      id: Date.now(),
      title: "Untitled",
      content: "",
    };
    setNotes([newNote, ...notes]);
    setSelectedId(newNote.id);
  };

  const updateNote = (field, value) => {
    setNotes(
      notes.map((n) =>
        n.id === selectedId ? { ...n, [field]: value } : n
      )
    );
  };

  const deleteNote = (id) => {
    setNotes(notes.filter((n) => n.id !== id));
    setSelectedId(null);
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    // <div className="flex h-screen bg-bg text-text">
    //   <Sidebar
    //     createNote={createNote}
    //     search={search}
    //     setSearch={setSearch}
    //   />

    //   <NotesList
    //     notes={filteredNotes}
    //     selectedId={selectedId}
    //     setSelectedId={setSelectedId}
    //   />

    //   <Editor
    //     note={selectedNote}
    //     updateNote={updateNote}
    //     deleteNote={deleteNote}
    //   />
    // </div>
    <div className="flex h-screen bg-bg text-text">
      <Sidebar
        createNote={createNote}
        search={search}
        setSearch={setSearch}
      />

      <div className="flex-1 flex flex-col">
        <Topbar dark={dark} setDark={setDark} />

        <div className="flex flex-1">
          <NotesList
            notes={filteredNotes}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
          />

          <Editor
            note={selectedNote}
            updateNote={updateNote}
            deleteNote={deleteNote}
          />
        </div>
      </div>
    </div>
  );
}

