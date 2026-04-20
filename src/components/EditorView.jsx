import { useState, useRef, useEffect } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Undo2, Redo2, Bold, Italic, Heading1, Heading2,
  List, AlignLeft, Link, Image, Video, Paperclip,
  Mic, X, Plus, Search, SlidersHorizontal, User,
  Maximize2, CheckCircle2, AlertCircle
} from "lucide-react";
import { useNotes } from "../context/NotesContext";
import { extractPlainText, plainTextToHtml } from "../utils/textUtils";

const CATEGORIES = ["UNCATEGORIZED", "STUDY", "WORK", "PERSONAL", "RESEARCH"];

const TOOLBAR_RIGHT = [
  { icon: Image, title: "Image" },
  { icon: Video, title: "Video" },
  { icon: Paperclip, title: "Attach" },
  { icon: Mic, title: "Voice", accent: true },
];

export default function EditorView({ note, onBack }) {
  const { addNote, updateNote } = useNotes();
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [category, setCategory] = useState(note?.category || "UNCATEGORIZED");
  const [tags, setTags] = useState(note?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [saved, setSaved] = useState(true);
  const [saveStatus, setSaveStatus] = useState("auto-saved"); // "auto-saved", "saving", "unsaved"
  const [lastSavedTime, setLastSavedTime] = useState(null);
  
  const noteIdRef = useRef(note?.id || null); // Use ref to track note ID synchronously
  const saveTimeoutRef = useRef(null);
  const autoSaveIntervalRef = useRef(null);

  // Save function
  const performSave = () => {
    setSaveStatus("saving");
    setTimeout(() => {
      // Store plain text instead of HTML
      const plainTextContent = extractPlainText(content);
      
      if (noteIdRef.current) {
        // Update existing note
        updateNote(noteIdRef.current, { title, content: plainTextContent, category, tags });
      } else if (title.trim()) {
        // Create new note only if title exists and no note ID yet
        const newNote = addNote({ title, content: plainTextContent, category, tags });
        noteIdRef.current = newNote.id; // Update ref immediately to prevent duplicate notes
      }
      
      setSaved(true);
      setSaveStatus("auto-saved");
      setLastSavedTime(new Date());
    }, 300);
  };

  // Debounced save
  const debouncedSave = () => {
    setSaveStatus("unsaved");
    setSaved(false);
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      performSave();
    }, 2000); // Save after 2 seconds of inactivity
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your note...',
      }),
    ],
    content: note?.content ? plainTextToHtml(note.content) : '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      debouncedSave();
    },
  });

  // Format time display
  const getTimeDisplay = () => {
    if (!lastSavedTime) return "Not saved yet";
    const now = new Date();
    const diffMs = now - lastSavedTime;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffMins === 0) return "Just now";
    if (diffMins === 1) return "1 min ago";
    if (diffMins < 60) return `${diffMins} mins ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  // Update time display every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastSavedTime) {
        // Force re-render by updating a dummy state
        setSaved(s => s);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [lastSavedTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current);
    };
  }, []);

  const TOOLBAR_LEFT = [
    { icon: Undo2, action: () => editor?.chain().focus().undo().run(), title: "Undo" },
    { icon: Redo2, action: () => editor?.chain().focus().redo().run(), title: "Redo" },
    { divider: true },
    { icon: Bold, action: () => editor?.chain().focus().toggleBold().run(), title: "Bold" },
    { icon: Italic, action: () => editor?.chain().focus().toggleItalic().run(), title: "Italic" },
    { divider: true },
    { label: "H1", action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(), title: "Heading 1" },
    { label: "H2", action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), title: "Heading 2" },
    { divider: true },
    { icon: List, action: () => editor?.chain().focus().toggleBulletList().run(), title: "List" },
    { icon: AlignLeft, action: () => {}, title: "Align" },
    { icon: Link, action: () => {}, title: "Link" },
  ];

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t.startsWith("#") ? t : `#${t}`]);
    }
    setTagInput("");
    setShowTagInput(false);
  };

  const removeTag = (tag) => setTags(tags.filter((t) => t !== tag));

  return (
    <div className={`h-full flex flex-col overflow-hidden transition-colors duration-300 ${isFocusMode ? "bg-gradient-to-br from-[#FFFBF7] to-[#F7F4EF]" : ""}`}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-[#D9D6CF] shrink-0 bg-white/50 backdrop-blur-sm shadow-xs hover:shadow-sm transition-all">
        <button onClick={onBack} className="text-[14px] font-bold text-[#1A1A1A] hover:text-[#1E3A3A] transition-colors flex items-center gap-2">
          <span className="opacity-60">←</span>
          <span>Monolith Notes</span>
        </button>

        {/* Search */}
        <div className="flex items-center gap-2.5 bg-white/70 border border-[#D0CCC6] rounded-xl px-4 py-2 w-60 hover:border-[#C8C3BA] transition-all">
          <Search size={13} className="text-[#9A9690]" strokeWidth={2} />
          <input placeholder="Search archive..." className="bg-transparent text-[12px] text-[#1A1A1A] placeholder-[#C8C3BA] outline-none w-full" />
        </div>

        <div className="flex items-center gap-3">
          {/* Save indicator - Improved */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${
            saveStatus === "auto-saved" 
              ? "bg-[#E8F5E9] text-[#2E7D32]" 
              : saveStatus === "saving"
              ? "bg-[#FFF3E0] text-[#F57C00] animate-pulse"
              : "bg-[#FFEBEE] text-[#C62828]"
          }`}>
            {saveStatus === "auto-saved" && <CheckCircle2 size={14} strokeWidth={2.5} />}
            {saveStatus === "saving" && <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
            {saveStatus === "unsaved" && <AlertCircle size={14} strokeWidth={2.5} />}
            <span className="text-[11px] font-medium whitespace-nowrap">
              {saveStatus === "auto-saved" && `Saved ${getTimeDisplay()}`}
              {saveStatus === "saving" && "Saving..."}
              {saveStatus === "unsaved" && "Unsaved changes"}
            </span>
          </div>
          <button className="p-1.5 rounded-lg hover:bg-[#E5E2DC] transition-colors">
            <SlidersHorizontal size={16} className="text-[#5A5854]" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4A3728] to-[#2D1F17] flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
            JT
          </div>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-[#D9D6CF] shrink-0 bg-gradient-to-r from-white/50 to-white/30 backdrop-blur-xs">
        <div className="flex items-center gap-0.5">
          {TOOLBAR_LEFT.map((item, i) =>
            item.divider ? (
              <div key={i} className="w-px h-5 bg-[#D0CCC6] mx-1" />
            ) : item.label ? (
              <button
                key={i}
                onClick={item.action}
                title={item.title}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#1A1A1A] bg-white/40 hover:bg-white/80 hover:text-[#1E3A3A] transition-all shadow-sm hover:shadow-md"
              >
                {item.label}
              </button>
            ) : (
              <button
                key={i}
                onClick={item.action}
                title={item.title}
                className="p-1.5 rounded-lg text-[#5A5854] hover:bg-white/80 hover:text-[#1A1A1A] transition-all hover:shadow-sm"
              >
                <item.icon size={14} strokeWidth={2} />
              </button>
            )
          )}
        </div>
        <div className="flex items-center gap-1">
          {TOOLBAR_RIGHT.map(({ icon: Icon, title, accent }) => (
            <button
              key={title}
              title={title}
              className={`p-1.5 rounded-lg transition-all shadow-sm hover:shadow-md ${
                accent ? "bg-gradient-to-br from-[#1E3A3A] to-[#0F2020] text-white hover:from-[#2A4A4A] hover:to-[#1A3030]" : "text-[#5A5854] bg-white/40 hover:bg-white/80"
              }`}
            >
              <Icon size={14} strokeWidth={2} />
            </button>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white/30 via-white/20 to-transparent">
        <div className="max-w-[800px] mx-auto px-8 py-12">
          {/* Title */}
          <input
            value={title}
            onChange={(e) => { 
              setTitle(e.target.value);
              debouncedSave();
            }}
            placeholder="Enter note title..."
            className="w-full text-[42px] font-bold text-[#1A1A1A] placeholder-[#9A9690] bg-transparent outline-none leading-tight tracking-tight mb-6 transition-colors hover:text-[#2A2A2A]"
            style={{ fontFamily: "'Georgia', serif" }}
          />

          {/* Category + Tags */}
          <div className="flex items-center flex-wrap gap-2 mb-6">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                debouncedSave();
              }}
              className="text-[11px] tracking-[0.08em] uppercase font-medium text-[#1E3A3A] bg-[#E8E5DF]/80 hover:bg-[#E8E5DF] border border-[#D0CCC6] rounded-lg px-3 py-1.5 outline-none cursor-pointer appearance-none transition-colors focus:ring-2 focus:ring-[#1E3A3A]/20"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            {tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1.5 bg-gradient-to-r from-[#E8E5DF] to-[#F0EDE8] text-[#1A1A1A] text-[11px] font-medium px-3 py-1 rounded-full border border-[#D0CCC6] shadow-sm hover:shadow-md transition-all">
                {tag}
                <button 
                  onClick={() => {
                    removeTag(tag);
                    debouncedSave();
                  }}
                  className="text-[#9A9690] hover:text-[#C62828] transition-colors"
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              </span>
            ))}

            {showTagInput ? (
              <input
                autoFocus
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { 
                  if (e.key === "Enter") {
                    addTag();
                    debouncedSave();
                  }
                  if (e.key === "Escape") setShowTagInput(false); 
                }}
                onBlur={() => {
                  if (tagInput.trim()) {
                    addTag();
                    debouncedSave();
                  } else {
                    setShowTagInput(false);
                  }
                }}
                placeholder="#tag"
                className="text-[11px] bg-[#E8E5DF] text-[#1A1A1A] px-3 py-1 rounded-lg outline-none border border-[#D0CCC6] focus:ring-2 focus:ring-[#1E3A3A]/20 transition-all"
              />
            ) : (
              <button
                onClick={() => setShowTagInput(true)}
                className="w-7 h-7 rounded-lg border border-[#D0CCC6] flex items-center justify-center hover:bg-[#E5E2DC] hover:border-[#C8C3BA] transition-all shadow-sm hover:shadow-md"
              >
                <Plus size={13} className="text-[#5A5854]" strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* Content */}
          <EditorContent
            editor={editor}
            className="text-[#1A1A1A] text-[17px] leading-relaxed outline-none max-w-none transition-colors min-h-[300px]"
            style={{ fontFamily: "'Georgia', serif" }}
          />
        </div>
      </div>

      {/* Focus Mode Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsFocusMode(!isFocusMode)}
          className={`flex items-center gap-2 font-medium px-5 py-3 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105 duration-200 ${
            isFocusMode 
              ? "bg-gradient-to-r from-[#1E3A3A] to-[#0F2020] text-white" 
              : "bg-gradient-to-r from-[#2A2A2A] to-[#1A1A1A] text-white hover:from-[#3A3A3A] hover:to-[#2A2A2A]"
          }`}
        >
          <Maximize2 size={14} strokeWidth={2.5} />
          <span className="text-[12px]">FOCUS MODE</span>
        </button>
      </div>
    </div>
  );
}