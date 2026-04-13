import { useState, useRef } from "react";
import { UploadCloud, File, CheckCircle, AlertCircle } from "lucide-react";
import { useDocument } from "../../hooks/useDocument.js";

const ALLOWED = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "text/plain": "TXT",
};

export default function UploadZone() {
  const { status, metadata, error, setDocument } = useDocument();
  const [dragging, setDragging] = useState(false);
  const [localErr, setLocalErr] = useState(null);
  const inputRef = useRef(null);
  const uploading = status === "uploading";

  function validate(file) {
    if (!ALLOWED[file.type]) return "Only PDF, DOCX, and TXT files are accepted.";
    if (file.size > 10 * 1024 * 1024) return "File must be under 10 MB.";
    return null;
  }

  function handle(file) {
    const err = validate(file);
    if (err) { setLocalErr(err); return; }
    setLocalErr(null);
    setDocument(file);
  }

  const displayErr = localErr || error;
  const ready = status === "ready";

  return (
    <div>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handle(f); }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className={`rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition-all duration-200 ${
          dragging     ? "border-accent-green bg-accent-green/5"
          : ready      ? "border-accent-green/30 bg-accent-green/5"
          : uploading  ? "border-border opacity-60 cursor-wait"
          : "border-border hover:border-accent-green/40 hover:bg-bg-surface-light/20"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(e) => { const f = e.target.files[0]; if (f) handle(f); e.target.value = ""; }}
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-1">
            <div className="w-5 h-5 border-2 border-bg-surface-light border-t-accent-green rounded-full animate-spin" />
            <p className="text-text-muted text-xs">Parsing…</p>
          </div>
        ) : ready && metadata ? (
          <div className="flex flex-col items-center gap-1.5 py-1">
            <CheckCircle size={18} className="text-accent-green" />
            <p className="text-text-primary text-xs font-medium truncate max-w-full px-2">{metadata.fileName}</p>
            <p className="text-text-muted text-xs">{metadata.wordCount?.toLocaleString()} words</p>
            <p className="text-accent-green/70 text-xs">Click to replace</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <UploadCloud size={20} className={`transition-colors ${dragging ? "text-accent-green" : "text-text-muted"}`} />
            <p className="text-text-primary text-xs font-medium">Drop file here or click</p>
            <p className="text-text-muted text-xs">PDF · DOCX · TXT — max 10 MB</p>
          </div>
        )}
      </div>

      {displayErr && (
        <div className="flex items-center gap-1.5 mt-2 px-1">
          <AlertCircle size={12} className="text-accent-rose flex-shrink-0" />
          <p className="text-accent-rose text-xs">{displayErr}</p>
        </div>
      )}
    </div>
  );
}
