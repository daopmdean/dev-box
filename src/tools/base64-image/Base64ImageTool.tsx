import { useMemo, useState, useRef } from "react";
import TextArea from "../../components/ui/TextArea";

type Mode = "decode" | "encode";

export default function Base64ImageTool() {
  const [mode, setMode] = useState<Mode>("decode");
  const [base64Str, setBase64Str] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setBase64Str(result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setBase64Str(result);
    };
    reader.readAsDataURL(file);
  };

  const imageSrc = useMemo(() => {
    if (!base64Str) return "";
    // If it already has data:image..., return as is
    if (base64Str.startsWith("data:image/")) {
      return base64Str;
    }
    // Try to sanitize the string (remove whitespace/newlines)
    const sanitized = base64Str.replace(/\s+/g, "");
    
    // Otherwise, try to prefix it
    return `data:image/png;base64,${sanitized}`;
  }, [base64Str]);

  const handleDownload = () => {
    if (!imageSrc) return;
    const a = document.createElement("a");
    a.href = imageSrc;
    a.download = "image.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="inline-flex rounded-md bg-black/5 dark:bg-white/5 p-1">
          <button
            onClick={() => setMode("decode")}
            className={`rounded px-3 py-1 text-sm transition-colors ${
              mode === "decode" ? "bg-sky-500 text-white" : "text-gray-500 dark:text-white/60"
            }`}
          >
            Base64 to Image
          </button>
          <button
            onClick={() => setMode("encode")}
            className={`rounded px-3 py-1 text-sm transition-colors ${
              mode === "encode" ? "bg-sky-500 text-white" : "text-gray-500 dark:text-white/60"
            }`}
          >
            Image to Base64
          </button>
        </div>
      </div>

      {mode === "decode" ? (
        <div className="flex flex-col gap-4">
          <TextArea
            label="Base64 String"
            value={base64Str}
            onChange={(e) => setBase64Str(e.target.value)}
            placeholder="Paste your Base64 image string here..."
            className="h-32"
          />
          {imageSrc && (
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-white/70">Image Preview</span>
                <button
                  onClick={handleDownload}
                  className="rounded bg-sky-500/10 px-3 py-1 text-sm text-sky-600 hover:bg-sky-500/20 dark:bg-sky-500/20 dark:text-sky-300 dark:hover:bg-sky-500/30 transition-colors"
                >
                  Download Image
                </button>
              </div>
              <div className="flex items-center justify-center rounded-md border border-dashed border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/30 p-4 min-h-[16rem]">
                <img
                  src={imageSrc}
                  alt="Base64 Preview"
                  className="max-h-[32rem] max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                  onLoad={(e) => {
                    (e.target as HTMLImageElement).style.display = 'block';
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-white/70">Upload Image</span>
            <div 
              className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-8 transition-colors ${
                isDragging 
                  ? 'border-sky-500 bg-sky-500/10' 
                  : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/30 hover:bg-black/10 dark:hover:bg-white/5'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <span className="text-sm text-gray-500 dark:text-white/60">
                Click to select or drag and drop an image file here
              </span>
            </div>
          </div>
          {base64Str && (
            <TextArea
              label="Base64 Output"
              value={base64Str}
              readOnly
              copyable
              className="h-48"
            />
          )}
        </div>
      )}
    </div>
  );
}
