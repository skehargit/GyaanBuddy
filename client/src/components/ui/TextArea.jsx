import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const LoadingDots = () => {
  return (
    <motion.span
      className="inline-flex"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ repeat: Infinity, duration: 1.2 }}
    >
      <span>.</span>
      <motion.span
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
      >
        .
      </motion.span>
      <motion.span
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
      >
        .
      </motion.span>
    </motion.span>
  );
};

const TextArea = ({ textData, setTextData, isSubmitting,used,MAX_TEXT_CHARS }) => {
  return (
    <div className="relative">
      <label className="mb-1 block text-sm text-gray-300">Paste text</label>

      <motion.div
        className={`w-full rounded-md border px-3 py-2 text-sm text-gray-100 placeholder-gray-500 
          ${isSubmitting ? "border-zinc-600 bg-[#1a1a1a]" : "border-zinc-800 bg-[#151515] focus-within:border-zinc-700"}
        `}
        animate={
          isSubmitting
            ? { borderColor: ["#52525b", "#3f3f46", "#27272a", "#3f3f46", "#52525b"] } // pulsing
            : {}
        }
        transition={
          isSubmitting
            ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            : {}
        }
      >
        {!isSubmitting ? (
          <textarea
            value={textData}
            onChange={(e) => setTextData(e.target.value)}
            placeholder="Paste or type your data here..."
            rows={8}
            className="w-full resize-y bg-transparent outline-none"
          />
        ) : (
          <div className="line-clamp-1 w-full overflow-hidden text-ellipsis whitespace-nowrap">
            {textData}
            <LoadingDots />
          </div>
        )}
      </motion.div>
      <p className="text-gray-400 text-xs mt-2">{used}/{MAX_TEXT_CHARS} characters used</p>
    </div>
  );
};

export default TextArea;
