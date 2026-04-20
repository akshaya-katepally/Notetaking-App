import { createContext, useContext, useState, useEffect } from "react";

const STORAGE_KEY = "memoire-app-data";

const NOTE_IMAGE_DEFAULTS = {
  "Monolith Design System": "/note-monolith.svg",
  "Urban Habitats Report": "/note-urban.svg",
};

const SAMPLE_NOTES = [
  {
    id: "1",
    title: "Advanced Cognitive Architectures & LLM Logic",
    content: "The transition from static knowledge bases to fluid, generative architectures requires a fundamental shift in how we perceive data retrieval. We must move toward a more human-centered approach.",
    category: "STUDY",
    tags: ["#neuroscience", "#ai-logic"],
    date: "May 12, 2024",
    size: null,
    pages: null,
    featured: true,
    image: null,
  },
  {
    id: "2",
    title: "Monolith Design System",
    content: "Defining the 8px grid system and the tonal shifts required for the 'No-Line' aesthetic.",
    category: "WORK",
    tags: [],
    date: "2h ago",
    image: "https://images.unsplash.com/photo-1611047606025-a74bfb5eeb30?q=80&w=2231&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    featured: false,
  },
  {
    id: "3",
    title: "Weekend Brew Methods",
    content: "Testing the new light roast from Ethiopia. 92°C water temperature. 1:16 ratio. The acidity is bright, notes of bergamot and honey.",
    category: "PERSONAL",
    tags: [],
    date: "Dec 01",
    image: null,
    featured: false,
    avatar: "KB",
  },
  {
    id: "4",
    title: "Client Brief: Q3",
    content: "Phase 1 involves a deep dive into the user persona of the 'Creative Professional'. Focus on the key pain points.",
    category: "WORK",
    tags: ["#stakeholders", "#q3-goals"],
    date: "Yesterday",
    image: null,
    featured: false,
  },
  {
    id: "5",
    title: "Urban Habitats Report",
    content: "The impact of vertical green spaces on localized urban microclimates.",
    category: "RESEARCH",
    tags: [],
    date: "Nov 15",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80",
    pages: "8 Pages",
    size: "4.2 MB",
    featured: false,
  },
  {
    id: "6",
    title: "Morning Rituals",
    content: "A list of daily habits for creative focus.",
    category: "PERSONAL",
    tags: [],
    date: "Nov 10",
    image: null,
    featured: false,
    emoji: "💡",
  },
  {
    id: "7",
    title: "Linear Algebra Review",
    content: "Focusing on eigen decomposition and its applications in data science and machine learning pipelines.",
    category: "STUDY",
    tags: [],
    date: "Nov 28",
    image: null,
    featured: false,
  },
];

const NotesContext = createContext(null);

export function NotesProvider({ children }) {
  // 🔹 Normalize old notes (fix bad date formats)
  const normalizeNotes = (notesArray = []) => {
    return notesArray.map((note) => {
      let validDate = new Date(note.date);
      const titleImage = NOTE_IMAGE_DEFAULTS[note.title] || null;
      const usesLegacyRemoteImage =
        typeof note.image === "string" && note.image.includes("images.unsplash.com");
      const normalizedImage =
        titleImage && (!note.image || usesLegacyRemoteImage)
          ? titleImage
          : (note.image ?? null);

      // If invalid → replace with current time
      if (isNaN(validDate.getTime())) {
        validDate = new Date();
      }

      return {
        ...note,
        image: normalizedImage,
        date: validDate.toISOString(),
      };
    });
  };

  // 🔹 Load from localStorage (once)
  const loadInitialData = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        return {
          notes: normalizeNotes(SAMPLE_NOTES),
          trashedNotes: [],
          pinnedNotes: [],
          favoriteNotes: [],
        };
      }

      const parsed = JSON.parse(stored);

      return {
        notes: parsed.notes?.length
          ? normalizeNotes(parsed.notes)
          : normalizeNotes(SAMPLE_NOTES),

        trashedNotes: normalizeNotes(parsed.trashedNotes || []),
        pinnedNotes: parsed.pinnedNotes || [],
        favoriteNotes: parsed.favoriteNotes || [],
      };
    } catch (err) {
      console.error("Failed to load from localStorage:", err);

      return {
        notes: normalizeNotes(SAMPLE_NOTES),
        trashedNotes: [],
        pinnedNotes: [],
        favoriteNotes: [],
      };
    }
  };

  const initialData = loadInitialData();

  const [notes, setNotes] = useState(initialData.notes);
  const [trashedNotes, setTrashedNotes] = useState(initialData.trashedNotes);
  const [pinnedNotes, setPinnedNotes] = useState(initialData.pinnedNotes);
  const [favoriteNotes, setFavoriteNotes] = useState(initialData.favoriteNotes);

  // 🔹 Save to localStorage whenever anything changes
  useEffect(() => {
    const data = {
      notes,
      trashedNotes,
      pinnedNotes,
      favoriteNotes,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error("Failed to save to localStorage:", err);
    }
  }, [notes, trashedNotes, pinnedNotes, favoriteNotes]);

  // ------------------ Actions ------------------

  const addNote = (note) => {
    const newNote = {
      ...note,
      id: Date.now().toString(),
      date: new Date().toISOString(), // ✅ consistent
      pinned: false,
    };

    setNotes((prev) => [newNote, ...prev]);
    return newNote;
  };

  const updateNote = (id, updates) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              ...updates,
              date: new Date().toISOString(), // ✅ update timestamp
            }
          : n
      )
    );
  };

  const togglePin = (id) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, pinned: !n.pinned } : n
      )
    );

    setPinnedNotes((prev) =>
      prev.includes(id)
        ? prev.filter((pid) => pid !== id)
        : [...prev, id]
    );
  };

  const toggleFavorite = (id) => {
    setFavoriteNotes((prev) =>
      prev.includes(id)
        ? prev.filter((fid) => fid !== id)
        : [...prev, id]
    );
  };

  const trashNote = (id) => {
    const note = notes.find((n) => n.id === id);

    if (note) {
      setTrashedNotes((prev) => [note, ...prev]);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setPinnedNotes((prev) => prev.filter((pid) => pid !== id));
      setFavoriteNotes((prev) => prev.filter((fid) => fid !== id));
    }
  };

  const restoreNote = (id) => {
    const note = trashedNotes.find((n) => n.id === id);

    if (note) {
      setNotes((prev) => [note, ...prev]);
      setTrashedNotes((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const permanentlyDeleteNote = (id) => {
    setTrashedNotes((prev) =>
      prev.filter((n) => n.id !== id)
    );
  };

  const emptyTrash = () => {
    setTrashedNotes([]);
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        trashedNotes,
        pinnedNotes,
        favoriteNotes,
        addNote,
        updateNote,
        togglePin,
        toggleFavorite,
        trashNote,
        restoreNote,
        permanentlyDeleteNote,
        emptyTrash,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export const useNotes = () => useContext(NotesContext);