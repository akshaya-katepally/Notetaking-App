import { useState, useRef, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Underline as UnderlineIcon,
  ImagePlus,
  Video,
  Save,
  Shapes,
  Mic,
  Square,
  X,
  Plus,
  Search,
  SlidersHorizontal,
  Maximize2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useNotes } from "../context/NotesContext";
import { extractPlainText, plainTextToHtml } from "../utils/textUtils";
import TopBar from "./TopBar";

const CATEGORIES = ["UNCATEGORIZED", "STUDY", "WORK", "PERSONAL", "RESEARCH"];
const FONT_FAMILIES = [
  { label: "Calibri", value: "Calibri, 'Segoe UI', sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Times", value: "'Times New Roman', serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Courier", value: "'Courier New', monospace" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Trebuchet", value: "'Trebuchet MS', sans-serif" },
  { label: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
  { label: "Garamond", value: "Garamond, serif" },
  { label: "Cambria", value: "Cambria, serif" },
  { label: "Palatino", value: "'Palatino Linotype', serif" },
];
const FONT_SIZES = [10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 40];
const SHAPES = [
  { label: "Square", value: "■" },
  { label: "Circle", value: "●" },
  { label: "Triangle", value: "▲" },
  { label: "Diamond", value: "◆" },
];

const isHtmlLike = (text = "") => /<\/?[a-z][\s\S]*>/i.test(text);

const toEditorHtml = (text = "") => {
  if (!text) return "<p></p>";
  return isHtmlLike(text) ? text : plainTextToHtml(text);
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const FontSize = Extension.create({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }

              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

export default function EditorView({ note, onBack }) {
  const { addNote, updateNote } = useNotes();
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(toEditorHtml(note?.content || ""));
  const [category, setCategory] = useState(note?.category || "UNCATEGORIZED");
  const [tags, setTags] = useState(note?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [saved, setSaved] = useState(true);
  const [saveStatus, setSaveStatus] = useState("auto-saved");
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const noteIdRef = useRef(note?.id || null);
  const contentRef = useRef(toEditorHtml(note?.content || ""));
  const saveTimeoutRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recordingChunksRef = useRef([]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontSize,
      FontFamily.configure({
        types: ["textStyle"],
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      Image.configure({
        allowBase64: true,
      }),
      Youtube.configure({
        controls: true,
      }),
      Placeholder.configure({
        placeholder: "Start writing your note...",
      }),
    ],
    content: toEditorHtml(note?.content),
    onUpdate: ({ editor: activeEditor }) => {
      const html = activeEditor.getHTML();
      setContent(html);
      contentRef.current = html;
      debouncedSave();
    },
  });

  const performSave = useCallback(() => {
    setSaveStatus("saving");

    setTimeout(() => {
      const htmlContent = editor?.getHTML() || contentRef.current || "<p></p>";
      const plainTextContent = extractPlainText(htmlContent);

      if (noteIdRef.current) {
        updateNote(noteIdRef.current, {
          title: title.trim() || "Untitled",
          content: htmlContent,
          category,
          tags,
          plainTextContent,
        });
      } else if (title.trim() || plainTextContent.trim()) {
        const newNote = addNote({
          title: title.trim() || "Untitled",
          content: htmlContent,
          category,
          tags,
          plainTextContent,
        });
        noteIdRef.current = newNote.id;
      }

      setSaved(true);
      setSaveStatus("auto-saved");
      setLastSavedTime(new Date());
    }, 300);
  }, [addNote, category, editor, tags, title, updateNote]);

  const debouncedSave = useCallback(() => {
    setSaveStatus("unsaved");
    setSaved(false);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      performSave();
    }, 2000);
  }, [performSave]);

  const manualSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    performSave();
  }, [performSave]);

  const setFontSize = (size) => {
    editor?.chain().focus().setFontSize(`${size}px`).run();
    debouncedSave();
  };

  const insertLink = () => {
    const previousUrl = editor?.getAttributes("link").href || "";
    const url = window.prompt("Enter link URL", previousUrl);

    if (url === null) return;

    if (!url.trim()) {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
    debouncedSave();
  };

  const insertImage = () => {
    const src = window.prompt("Paste image URL");
    if (!src?.trim()) return;
    editor?.chain().focus().setImage({ src: src.trim() }).run();
    debouncedSave();
  };

  const insertVideo = () => {
    const src = window.prompt("Paste YouTube URL");
    if (!src?.trim()) return;
    editor?.chain().focus().setYoutubeVideo({ src: src.trim(), width: 640, height: 360 }).run();
    debouncedSave();
  };

  const onBrowseImageClick = () => {
    imageInputRef.current?.click();
  };

  const onBrowseVideoClick = () => {
    videoInputRef.current?.click();
  };

  const onImageSelected = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      editor?.chain().focus().setImage({ src: dataUrl }).run();
      debouncedSave();
    } finally {
      event.target.value = "";
    }
  };

  const onVideoSelected = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      editor
        ?.chain()
        .focus()
        .insertContent(`<video controls src="${dataUrl}"></video><p></p>`)
        .run();
      debouncedSave();
    } finally {
      event.target.value = "";
    }
  };

  const stopVoiceRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const startVoiceRecording = useCallback(async () => {
    if (!window.MediaRecorder) {
      window.alert("Voice recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recordingChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(recordingChunksRef.current, { type: "audio/webm" });
        const dataUrl = await fileToDataUrl(audioBlob);

        editor
          ?.chain()
          .focus()
          .insertContent(`<audio controls src="${dataUrl}"></audio><p></p>`)
          .run();

        debouncedSave();
        setIsRecording(false);

        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      window.alert("Microphone permission is required to record a voice note.");
    }
  }, [debouncedSave, editor]);

  const toggleVoiceRecording = () => {
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  const insertShape = () => {
    const selected = window.prompt("Type: square, circle, triangle, or diamond");
    if (!selected) return;

    const match = SHAPES.find((shape) => shape.label.toLowerCase() === selected.toLowerCase());
    if (!match) return;

    editor?.chain().focus().insertContent(`${match.value} `).run();
    debouncedSave();
  };

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

  useEffect(() => {
    const html = toEditorHtml(note?.content || "");
    setTitle(note?.title || "");
    setCategory(note?.category || "UNCATEGORIZED");
    setTags(note?.tags || []);
    setContent(html);
    contentRef.current = html;
    noteIdRef.current = note?.id || null;
    setSaved(true);
    setSaveStatus("auto-saved");
    setLastSavedTime(note?.date ? new Date(note.date) : null);

    if (editor) {
      editor.commands.setContent(html, false);
    }
  }, [editor, note]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const isSaveShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s";
      if (!isSaveShortcut) return;

      event.preventDefault();
      manualSave();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [manualSave]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (lastSavedTime) {
        setSaved((s) => s);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [lastSavedTime]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const TOOLBAR_LEFT = [
    { icon: Undo2, action: () => editor?.chain().focus().undo().run(), title: "Undo" },
    { icon: Redo2, action: () => editor?.chain().focus().redo().run(), title: "Redo" },
    { divider: true },
    { icon: Bold, action: () => editor?.chain().focus().toggleBold().run(), title: "Bold", active: editor?.isActive("bold") },
    { icon: Italic, action: () => editor?.chain().focus().toggleItalic().run(), title: "Italic", active: editor?.isActive("italic") },
    { icon: UnderlineIcon, action: () => editor?.chain().focus().toggleUnderline().run(), title: "Underline", active: editor?.isActive("underline") },
    { divider: true },
    { icon: List, action: () => editor?.chain().focus().toggleBulletList().run(), title: "Bullet List", active: editor?.isActive("bulletList") },
    { icon: ListOrdered, action: () => editor?.chain().focus().toggleOrderedList().run(), title: "Numbered List", active: editor?.isActive("orderedList") },
    { divider: true },
    { icon: AlignLeft, action: () => editor?.chain().focus().setTextAlign("left").run(), title: "Align Left", active: editor?.isActive({ textAlign: "left" }) },
    { icon: AlignCenter, action: () => editor?.chain().focus().setTextAlign("center").run(), title: "Align Center", active: editor?.isActive({ textAlign: "center" }) },
    { icon: AlignRight, action: () => editor?.chain().focus().setTextAlign("right").run(), title: "Align Right", active: editor?.isActive({ textAlign: "right" }) },
    { divider: true },
    { label: "H1", action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(), title: "Heading 1", active: editor?.isActive("heading", { level: 1 }) },
    { label: "H2", action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), title: "Heading 2", active: editor?.isActive("heading", { level: 2 }) },
    { divider: true },
    { icon: Link, action: insertLink, title: "Link", active: editor?.isActive("link") },
  ];

  const TOOLBAR_RIGHT = [
    { icon: ImagePlus, title: "Image (Browse)", action: onBrowseImageClick },
    { icon: Video, title: "Video (Browse)", action: onBrowseVideoClick },
    { icon: Video, title: "YouTube", action: insertVideo },
    { icon: Shapes, title: "Shape", action: insertShape },
    {
      icon: isRecording ? Square : Mic,
      title: isRecording ? "Stop Voice Note" : "Record Voice Note",
      action: toggleVoiceRecording,
      active: isRecording,
    },
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

  const currentFontFamily = editor?.getAttributes("textStyle").fontFamily || FONT_FAMILIES[0].value;
  const currentFontSize = editor?.getAttributes("textStyle").fontSize?.replace("px", "") || "16";

  return (
    <div className={`h-full flex flex-col overflow-hidden transition-colors duration-300 ${isFocusMode ? "bg-gradient-to-br from-[#FFFBF7] to-[#F7F4EF]" : ""}`}>
      <TopBar
        left={
          <button onClick={onBack} className="text-[14px] font-bold text-[#1A1A1A] hover:text-[#1E3A3A] transition-colors flex items-center gap-2">
            <span className="opacity-60">←</span>
            <span>Memoire</span>
          </button>
        }
        center={
          <div className="flex items-center gap-2.5 bg-white/70 border border-[#D0CCC6] rounded-xl px-4 py-2 w-60 hover:border-[#C8C3BA] transition-all">
            <Search size={13} className="text-[#9A9690]" strokeWidth={2} />
            <input placeholder="Search archive..." className="bg-transparent text-[12px] text-[#1A1A1A] placeholder-[#C8C3BA] outline-none w-full" />
          </div>
        }
        right={
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${
                saveStatus === "auto-saved"
                  ? "bg-[#E8F5E9] text-[#2E7D32]"
                  : saveStatus === "saving"
                    ? "bg-[#FFF3E0] text-[#F57C00] animate-pulse"
                    : "bg-[#FFEBEE] text-[#C62828]"
              }`}
            >
              {saveStatus === "auto-saved" && <CheckCircle2 size={14} strokeWidth={2.5} />}
              {saveStatus === "saving" && <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
              {saveStatus === "unsaved" && <AlertCircle size={14} strokeWidth={2.5} />}
              <span className="text-[11px] font-medium whitespace-nowrap">
                {saveStatus === "auto-saved" && `Saved ${getTimeDisplay()}`}
                {saveStatus === "saving" && "Saving..."}
                {saveStatus === "unsaved" && "Unsaved changes"}
              </span>
            </div>

            <button
              onClick={manualSave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E3A3A] text-white hover:bg-[#2A4A4A] transition-colors"
              title="Save (Ctrl/Cmd + S)"
            >
              <Save size={13} strokeWidth={2.5} />
              <span className="text-[11px] font-semibold">Save</span>
            </button>

            <button className="p-1.5 rounded-lg hover:bg-[#E5E2DC] transition-colors">
              <SlidersHorizontal size={16} className="text-[#5A5854]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4A3728] to-[#2D1F17] flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
              JT
            </div>
          </div>
        }
      />

      <div className="flex items-center justify-between px-6 py-2.5 border-b border-[#D9D6CF] shrink-0 bg-gradient-to-r from-white/50 to-white/30 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <select
            value={currentFontFamily}
            onChange={(e) => {
              editor?.chain().focus().setFontFamily(e.target.value).run();
              debouncedSave();
            }}
            className="h-8 min-w-[130px] rounded-md border border-[#D0CCC6] bg-white/70 px-2 text-[11px] outline-none"
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font.label} value={font.value}>{font.label}</option>
            ))}
          </select>

          <select
            value={currentFontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="h-8 w-[72px] rounded-md border border-[#D0CCC6] bg-white/70 px-2 text-[11px] outline-none"
          >
            {FONT_SIZES.map((size) => (
              <option key={size} value={size}>{size} px</option>
            ))}
          </select>

          <div className="flex items-center gap-0.5">
            {TOOLBAR_LEFT.map((item, i) =>
              item.divider ? (
                <div key={i} className="w-px h-5 bg-[#D0CCC6] mx-1" />
              ) : item.label ? (
                <button
                  key={i}
                  onClick={() => {
                    item.action();
                    debouncedSave();
                  }}
                  title={item.title}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm hover:shadow-md ${
                    item.active ? "bg-[#1E3A3A] text-white" : "text-[#1A1A1A] bg-white/40 hover:bg-white/80 hover:text-[#1E3A3A]"
                  }`}
                >
                  {item.label}
                </button>
              ) : (
                <button
                  key={i}
                  onClick={() => {
                    item.action();
                    debouncedSave();
                  }}
                  title={item.title}
                  className={`p-1.5 rounded-lg transition-all hover:shadow-sm ${
                    item.active ? "bg-[#1E3A3A] text-white" : "text-[#5A5854] hover:bg-white/80 hover:text-[#1A1A1A]"
                  }`}
                >
                  <item.icon size={14} strokeWidth={2} />
                </button>
              )
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {TOOLBAR_RIGHT.map(({ icon: Icon, title, action, active }) => (
            <button
              key={title}
              title={title}
              onClick={action}
              className={`p-1.5 rounded-lg transition-all shadow-sm hover:shadow-md ${
                active
                  ? "bg-[#C62828] text-white hover:bg-[#B71C1C]"
                  : "text-[#5A5854] bg-white/40 hover:bg-white/80"
              }`}
            >
              <Icon size={14} strokeWidth={2} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white/30 via-white/20 to-transparent">
        <div className="max-w-[920px] mx-auto px-8 py-12">
          <div className="bg-white border border-[#CFC8BE] shadow-[0_12px_40px_rgba(26,26,26,0.08)] rounded-md px-12 py-10 min-h-[70vh]">
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                debouncedSave();
              }}
              placeholder="Enter note title..."
              className="w-full text-[42px] font-bold text-[#1A1A1A] placeholder-[#9A9690] bg-transparent outline-none leading-tight tracking-tight mb-6 transition-colors hover:text-[#2A2A2A]"
              style={{ fontFamily: "Calibri, 'Segoe UI', sans-serif" }}
            />

            <div className="flex items-center flex-wrap gap-2 mb-6">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  debouncedSave();
                }}
                className="text-[11px] tracking-[0.08em] uppercase font-medium text-[#1E3A3A] bg-[#E8E5DF]/80 hover:bg-[#E8E5DF] border border-[#D0CCC6] rounded-lg px-3 py-1.5 outline-none cursor-pointer appearance-none transition-colors focus:ring-2 focus:ring-[#1E3A3A]/20"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
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

            <div className="word-editor" onClick={() => editor?.chain().focus("end").run()} role="presentation">
              <EditorContent
                editor={editor}
                className="text-[#1A1A1A] text-[16px] leading-relaxed outline-none max-w-none transition-colors min-h-[540px]"
                style={{ fontFamily: "Calibri, 'Segoe UI', sans-serif" }}
              />
            </div>
          </div>
        </div>
      </div>

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

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onImageSelected}
      />

      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={onVideoSelected}
      />
    </div>
  );
}
