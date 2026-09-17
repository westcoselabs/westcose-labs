"use client";

import {
  FloppyDisk,
  FolderOpen,
  MagnifyingGlass,
  NotePencil,
  PushPin,
  SidebarSimple,
  X,
} from "@phosphor-icons/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  countWords,
  formatNoteDate,
  type NoteLibraryItem,
} from "@/lib/notes";
import { noteFolderRegistry } from "@/registry";

import type { NotesController } from "../useNotesController";
import styles from "./DesktopNotepad.module.css";

type MenuId = "file" | "edit" | "format" | "view" | "help";

function Menu({
  children,
  id,
  label,
  onOpen,
  open,
}: {
  readonly children: ReactNode;
  readonly id: MenuId;
  readonly label: string;
  readonly onOpen: (id: MenuId | null) => void;
  readonly open: boolean;
}) {
  return (
    <div className={styles.menuWrap}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => onOpen(open ? null : id)}
        type="button"
      >
        {label}
      </button>
      {open ? <div className={styles.menu} role="menu">{children}</div> : null}
    </div>
  );
}

function MenuAction({
  children,
  disabled = false,
  onClick,
  shortcut,
}: {
  readonly children: ReactNode;
  readonly disabled?: boolean;
  readonly onClick: () => void;
  readonly shortcut?: string;
}) {
  return (
    <button disabled={disabled} onClick={onClick} role="menuitem" type="button">
      <span>{children}</span>
      {shortcut ? <kbd>{shortcut}</kbd> : null}
    </button>
  );
}

const downloadNote = (note: NoteLibraryItem) => {
  const url = URL.createObjectURL(new Blob([note.body], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.download = note.desktopFileName;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
};

export function DesktopNotepad({
  controller,
}: {
  readonly controller: NotesController;
}) {
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [statusVisible, setStatusVisible] = useState(true);
  const [metadataVisible, setMetadataVisible] = useState(true);
  const [wordWrap, setWordWrap] = useState(true);
  const [readingWidth, setReadingWidth] = useState(true);
  const [monospace, setMonospace] = useState(true);
  const [findVisible, setFindVisible] = useState(false);
  const [findQuery, setFindQuery] = useState("");
  const [message, setMessage] = useState("");
  const [lastDeleted, setLastDeleted] = useState<NoteLibraryItem | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const folderScope =
    controller.view.kind === "folder" ? controller.view.folderId : undefined;
  const scopedNotes = controller.filterNotes(folderScope);
  const activeNote =
    controller.selectedNote ?? scopedNotes[0] ?? controller.filterNotes()[0];
  const visibleNotes = controller.filterNotes();
  const recycledNotes = controller.filterNotes("recently-deleted");
  const title = activeNote?.desktopFileName ?? "Untitled.txt";

  const closeMenu = useCallback((action: () => void) => {
    action();
    setOpenMenu(null);
  }, []);

  const share = useCallback(async () => {
    if (!activeNote) return;
    setMessage(await controller.shareNote(activeNote));
  }, [activeNote, controller]);

  const selectAll = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus();
      editorRef.current.select();
      return;
    }
    const editor = rootRef.current?.querySelector(`.${styles.readonlyEditor}`);
    if (!editor) return;
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }, []);

  const findNext = useCallback(() => {
    if (!activeNote || !findQuery.trim()) {
      setMessage("Enter text to find.");
      return;
    }
    const index = activeNote.body.toLocaleLowerCase().indexOf(findQuery.toLocaleLowerCase());
    if (index < 0) {
      setMessage(`Cannot find “${findQuery}”.`);
      return;
    }
    if (editorRef.current) {
      editorRef.current.focus();
      editorRef.current.setSelectionRange(index, index + findQuery.length);
    }
    setMessage(`Found “${findQuery}”.`);
  }, [activeNote, findQuery]);

  const rename = useCallback(() => {
    if (!activeNote) return;
    if (activeNote.id === "final-final-v8") {
      setMessage("This file is already final.");
      controller.recordFinalRenameRefusal();
      return;
    }
    if (activeNote.source === "curated") {
      setMessage("Curated notes are read-only.");
      return;
    }
    titleRef.current?.focus();
    titleRef.current?.select();
  }, [activeNote, controller]);

  const recycle = useCallback(() => {
    if (!activeNote || activeNote.deletedAt) return;
    setLastDeleted(activeNote);
    controller.deleteNote(activeNote, false);
    setMessage(`${activeNote.desktopFileName} moved to Recycle.`);
  }, [activeNote, controller]);

  const undoDelete = useCallback(() => {
    if (!lastDeleted) return;
    controller.restoreNote(lastDeleted);
    setMessage(`${lastDeleted.desktopFileName} restored.`);
    setLastDeleted(null);
  }, [controller, lastDeleted]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
        return;
      }
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLocaleLowerCase() === "n") {
        event.preventDefault();
        controller.compose();
      }
      if (event.key.toLocaleLowerCase() === "f") {
        event.preventDefault();
        setFindVisible(true);
      }
      if (event.key.toLocaleLowerCase() === "s" && activeNote) {
        event.preventDefault();
        downloadNote(activeNote);
        setMessage("Local copy saved.");
      }
      if (event.key.toLocaleLowerCase() === "z" && lastDeleted) {
        event.preventDefault();
        undoDelete();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeNote, controller, lastDeleted, undoDelete]);

  const grouped = useMemo(
    () => [
      { id: "pinned", label: "Pinned", notes: visibleNotes.filter((note) => note.pinned) },
      ...noteFolderRegistry
        .filter((folder) => folder.kind === "collection")
        .map((folder) => ({
          id: folder.id,
          label: folder.name,
          notes: visibleNotes.filter((note) => note.folderId === folder.id),
        })),
      { id: "recently-deleted", label: "Recently Deleted", notes: recycledNotes },
    ].filter((group) => group.notes.length > 0),
    [recycledNotes, visibleNotes],
  );

  return (
    <div
      className={styles.notepad}
      data-app-presenter="desktop-notepad"
      data-route-content
      ref={rootRef}
    >
      <div className={styles.documentTitle}>
        <NotePencil aria-hidden="true" weight="fill" />
        <h1 tabIndex={-1}>{title} - Pocket Notepad</h1>
      </div>
      <nav aria-label="Pocket Notepad menu" className={styles.menuBar} role="menubar">
        <Menu id="file" label="File" onOpen={setOpenMenu} open={openMenu === "file"}>
          <MenuAction onClick={() => closeMenu(controller.compose)} shortcut="Ctrl+N">New Note</MenuAction>
          <MenuAction onClick={() => closeMenu(() => setSidebarVisible(true))}>Open</MenuAction>
          <MenuAction
            disabled={!activeNote}
            onClick={() => closeMenu(() => activeNote && downloadNote(activeNote))}
            shortcut="Ctrl+S"
          >Save Local Copy</MenuAction>
          <MenuAction disabled={!activeNote} onClick={() => closeMenu(() => void share())}>Share</MenuAction>
          <MenuAction disabled={!activeNote || Boolean(activeNote?.deletedAt)} onClick={() => closeMenu(recycle)}>Move to Recycle</MenuAction>
          <MenuAction onClick={() => closeMenu(controller.closeNotes)}>Close</MenuAction>
        </Menu>
        <Menu id="edit" label="Edit" onOpen={setOpenMenu} open={openMenu === "edit"}>
          <MenuAction disabled={!lastDeleted} onClick={() => closeMenu(undoDelete)} shortcut="Ctrl+Z">Undo Delete</MenuAction>
          <MenuAction disabled={!activeNote} onClick={() => closeMenu(rename)}>Rename</MenuAction>
          <MenuAction disabled={!activeNote} onClick={() => closeMenu(selectAll)} shortcut="Ctrl+A">Select All</MenuAction>
          <MenuAction onClick={() => closeMenu(() => setFindVisible(true))} shortcut="Ctrl+F">Find</MenuAction>
          <MenuAction onClick={() => closeMenu(findNext)}>Find Next</MenuAction>
        </Menu>
        <Menu id="format" label="Format" onOpen={setOpenMenu} open={openMenu === "format"}>
          <MenuAction onClick={() => closeMenu(() => setWordWrap((value) => !value))}>{wordWrap ? "✓ " : ""}Word Wrap</MenuAction>
          <MenuAction onClick={() => closeMenu(() => setReadingWidth((value) => !value))}>{readingWidth ? "✓ " : ""}Reading Width</MenuAction>
          <MenuAction onClick={() => closeMenu(() => setMonospace((value) => !value))}>{monospace ? "✓ " : ""}Monospace Mode</MenuAction>
        </Menu>
        <Menu id="view" label="View" onOpen={setOpenMenu} open={openMenu === "view"}>
          <MenuAction onClick={() => closeMenu(() => setSidebarVisible((value) => !value))}>{sidebarVisible ? "✓ " : ""}File Sidebar</MenuAction>
          <MenuAction onClick={() => closeMenu(() => setStatusVisible((value) => !value))}>{statusVisible ? "✓ " : ""}Status Bar</MenuAction>
          <MenuAction onClick={() => closeMenu(() => setMetadataVisible((value) => !value))}>{metadataVisible ? "✓ " : ""}Metadata</MenuAction>
        </Menu>
        <Menu id="help" label="Help" onOpen={setOpenMenu} open={openMenu === "help"}>
          <MenuAction onClick={() => closeMenu(() => setMessage("Pocket Notepad uses shared local Notes data in a desktop-first editor."))}>About Pocket Notepad</MenuAction>
          <MenuAction onClick={() => closeMenu(() => setMessage("Because the plain-text editor still works."))}>Why is this still in production?</MenuAction>
        </Menu>
      </nav>

      {controller.notification ? (
        <aside className={styles.discovery} role="status">
          <span><strong>{controller.notification.title}</strong>{controller.notification.copy}</span>
          <button aria-label="Dismiss discovery" onClick={controller.dismissNotification} type="button"><X aria-hidden="true" /></button>
        </aside>
      ) : null}

      {findVisible ? (
        <form
          className={styles.findBar}
          onSubmit={(event) => {
            event.preventDefault();
            findNext();
          }}
        >
          <MagnifyingGlass aria-hidden="true" />
          <label><span className="sr-only">Find text</span><input autoFocus onChange={(event) => setFindQuery(event.currentTarget.value)} placeholder="Find" value={findQuery} /></label>
          <button type="submit">Find Next</button>
          <button aria-label="Close Find" onClick={() => setFindVisible(false)} type="button"><X aria-hidden="true" /></button>
        </form>
      ) : null}

      <div className={styles.workspace} data-sidebar={sidebarVisible || undefined}>
        {sidebarVisible ? (
          <aside aria-label="Note files" className={styles.sidebar}>
            <header><FolderOpen aria-hidden="true" /><strong>Note Files</strong></header>
            {grouped.map((group) => (
              <section key={group.id}>
                <h2>{group.label}</h2>
                <ul>
                  {group.notes.map((note) => (
                    <li key={`${group.id}-${note.id}`}>
                      <button
                        aria-current={activeNote?.id === note.id ? "page" : undefined}
                        onClick={() => controller.openNote(note.id)}
                        type="button"
                      >
                        <span>{note.desktopFileName}</span>
                        {note.pinned ? <PushPin aria-label="Pinned" weight="fill" /> : null}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </aside>
        ) : null}

        <main className={styles.editorPane}>
          {lastDeleted ? (
            <div className={styles.undoBar} role="status">
              <span>{lastDeleted.desktopFileName} moved to Recycle.</span>
              <button onClick={undoDelete} type="button">Undo</button>
            </div>
          ) : null}
          {activeNote ? (
            <>
              {metadataVisible ? (
                <div className={styles.metadata}>
                  <span>{activeNote.source === "local" ? "LOCAL FILE" : "READ-ONLY CURATED FILE"}</span>
                  <span>{formatNoteDate(activeNote.updatedAt)}</span>
                  <label>
                    <span className="sr-only">Move note to folder</span>
                    <select
                      aria-label="Move note to folder"
                      disabled={Boolean(activeNote.deletedAt)}
                      onChange={(event) => controller.moveNote(activeNote, event.currentTarget.value)}
                      value={activeNote.folderId}
                    >
                      {noteFolderRegistry.filter((folder) => folder.kind === "collection").map((folder) => (
                        <option key={folder.id} value={folder.id}>{folder.name}</option>
                      ))}
                    </select>
                  </label>
                  <button onClick={() => controller.togglePin(activeNote)} type="button">
                    <PushPin aria-hidden="true" weight={activeNote.pinned ? "fill" : "regular"} />
                    {activeNote.pinned ? "Unpin" : "Pin"}
                  </button>
                </div>
              ) : null}
              <div
                className={styles.editorCanvas}
                data-monospace={monospace || undefined}
                data-reading-width={readingWidth || undefined}
                data-word-wrap={wordWrap || undefined}
              >
                {activeNote.source === "local" && !activeNote.deletedAt ? (
                  <>
                    <input
                      aria-label="Note title"
                      className={styles.titleInput}
                      onChange={(event) => controller.updateLocalNote(activeNote, { title: event.currentTarget.value })}
                      ref={titleRef}
                      value={activeNote.title}
                    />
                    <textarea
                      aria-label="Note body"
                      onChange={(event) => controller.updateLocalNote(activeNote, { body: event.currentTarget.value })}
                      placeholder="Start typing..."
                      ref={editorRef}
                      spellCheck="true"
                      value={activeNote.body}
                      wrap={wordWrap ? "soft" : "off"}
                    />
                  </>
                ) : (
                  <div className={styles.readonlyEditor} tabIndex={0}>
                    <h2>{activeNote.title}</h2>
                    {activeNote.body.split(/\n{2,}/u).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    {activeNote.deletedAt ? <p><strong>This note is in Recycle.</strong></p> : null}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              <FloppyDisk aria-hidden="true" />
              <h2>No note open</h2>
              <button onClick={controller.compose} type="button">Create New Note</button>
            </div>
          )}
        </main>
      </div>

      {statusVisible ? (
        <footer className={styles.statusBar}>
          <span>Ln 1, Col 1</span>
          <span>Words: {countWords(activeNote?.body ?? "")}</span>
          <span>UTF-8</span>
          <span>Build stable enough</span>
          <span className={styles.statusMessage} aria-live="polite">{message}</span>
          <button aria-label="Toggle file sidebar" onClick={() => setSidebarVisible((value) => !value)} type="button"><SidebarSimple aria-hidden="true" /></button>
        </footer>
      ) : null}
    </div>
  );
}
