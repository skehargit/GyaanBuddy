import React, { useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";

const MAX_FILE_SIZE_MB = 0.5;
const STORAGE_KEY = "uploadedFile";

const FileUpload = ({ handleFileChange, isSubmitting, file, setFile }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  // Load existing file from localStorage
  useEffect(() => {
    const savedFile = localStorage.getItem(STORAGE_KEY);
    if (savedFile) {
      setFile(JSON.parse(savedFile));
    }
  }, []);

  const onFileSelected = (selectedFiles) => {
    setError("");
    if (!selectedFiles || selectedFiles.length === 0) return;

    if (file) {
      setError("Free mode: only 1 file can be uploaded.");
      return;
    }

    const selectedFile = selectedFiles[0];
    const sizeMB = selectedFile.size / 1024 / 1024;

    if (sizeMB > MAX_FILE_SIZE_MB) {
      setError(`File too large. Max allowed size is ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    // Store in localStorage
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ name: selectedFile.name, size: selectedFile.size })
    );

    setFile({ name: selectedFile.name, size: selectedFile.size });
    handleFileChange({ target: { files: [selectedFile] } });
  };

  const removeFile = () => {
    setFile(null);
    localStorage.removeItem(STORAGE_KEY);
    handleFileChange({ target: { files: [] } });
    setError("");
  };

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFileSelected(e.dataTransfer.files);
        e.dataTransfer.clearData();
      }
    },
    [file]
  );

  return (
    <div>
      <label className="mb-2 block text-sm text-gray-300">Upload files</label>
      <p className="mb-2 text-xs text-gray-400">
        Supported: <span className="text-gray-300">PDF, JSON, TXT, CSV, MD</span>
      </p>

      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

      {file && !isSubmitting ? (
        <motion.div
          className="w-full rounded-lg bg-[#1f1f1f] border border-zinc-700 p-3 text-sm text-gray-200"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="mb-2 text-gray-400 text-xs">Uploaded file:</p>
          <ul className="space-y-1 max-h-32 overflow-y-auto">
            <li className="truncate text-gray-200 text-sm border-b border-zinc-700/40 pb-1 last:border-0">
              📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </li>
          </ul>
          <button
            onClick={removeFile}
            className="mt-2 text-xs text-red-400 hover:underline"
          >
            Remove File
          </button>
        </motion.div>
      ) : (
        <motion.div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          animate={
            isSubmitting
              ? {
                  borderColor: [
                    "#52525b",
                    "#3f3f46",
                    "#27272a",
                    "#3f3f46",
                    "#52525b",
                  ],
                }
              : {}
          }
          transition={
            isSubmitting
              ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
              : {}
          }
          className={`relative flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer transition-colors
            ${
              isDragging
                ? "border-zinc-600 bg-black"
                : "border-zinc-800 bg-[#151515]"
            }
          `}
          whileTap={{ scale: 0.98 }}
        >
          <input
            type="file"
            multiple={false}
            onChange={(e) => onFileSelected(e.target.files)}
            accept=".pdf,.csv,.txt,.md,.json"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {isSubmitting ? (
            <motion.div
              className="flex items-center gap-2 text-gray-400 text-sm"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              <div className="w-4 h-4 border-2 border-t-transparent border-gray-400 rounded-full animate-spin" />
              Uploading...
            </motion.div>
          ) : (
            <motion.div
              animate={{ y: isDragging ? -4 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex flex-col items-center text-gray-400 text-xs"
            >
              <svg
                className="w-5 h-5 mb-1 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
              <p className="text-center">
                {isDragging
                  ? "Drop file here"
                  : (
                      <>
                        <>Drag & Drop or Click to Upload</>
                        <br />
                        (Free: max 1 file, 0.5 MB)
                      </>
                    )}
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default FileUpload;
