import React from "react";
import { motion } from "framer-motion";
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
const WebsiteInput = ({ websiteUrl, setWebsiteUrl, isSubmitting }) => {

  return (
    <div>
      <label className="mb-1 block text-sm text-gray-300">Website URL</label>

      <motion.div
        className={`w-full rounded-md border px-3 py-2 text-sm text-gray-100 placeholder-gray-500 
                ${
                  isSubmitting
                    ? "border-zinc-600 bg-[#1a1a1a]"
                    : "border-zinc-800 bg-[#151515] focus-within:border-zinc-700"
                }
              `}
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
            ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            : {}
        }
      >
        {!isSubmitting ? (
          <input
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="w-full resize-y bg-transparent outline-none"
          />
        ) : (
          <div className="line-clamp-1 w-full overflow-hidden text-ellipsis whitespace-nowrap">
            {websiteUrl}
            <LoadingDots />
          </div>
        )}
      </motion.div>
      <p className="mt-2 text-gray-400 text-xs">
        Free mode: Best results with static pages. Only 1 website can be submitted.
      </p>
    </div>
  );
};

export default WebsiteInput;
