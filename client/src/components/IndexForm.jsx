import axios from "axios";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Tabs from "./ui/Tabs";
import TextArea from "./ui/TextArea";
import FIleUpload from "./ui/FIleUpload";
import WebsiteInput from "./ui/WebsiteInput";

const MAX_TEXT_CHARS = 4000;

const IndexForm = ({
  isSubmitting,
  setIsSubmitting,
  thinking,
  messageCount,
  tabs,
  activeTab,
  setActiveTab,
}) => {
  const [textData, setTextData] = useState("");
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const [submittedCount, setSubmittedCount] = useState({
    textChars: 0,
    Upload: 0,
    Website: 0,
  });

  // Load submission counts from localStorage
  useEffect(() => {
    const counts = JSON.parse(localStorage.getItem("submittedCount") || "{}");
    setSubmittedCount({
      textChars: counts.textChars || 0,
      Upload: counts.Upload || 0,
      Website: counts.Website || 0,
    });
  }, []);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    // Tab-specific submission limits
    if (activeTab === "TextArea") {
      if (textData.length <= 0) {
        setError(`Please write something in input!`);
        return;
      }
      const newTextTotal = submittedCount.textChars + textData.length;
      if (newTextTotal > MAX_TEXT_CHARS) {
        setError(
          `Free mode limit reached. Max ${MAX_TEXT_CHARS} characters allowed.`
        );
        return;
      }
    } else {
      if (!file || files.lengh == 0) {
        setError(`Please seclect a file to upload!`);
        return;
      }
      if (submittedCount[activeTab] >= 1) {
        setError(`Free mode: You can submit only 1 ${activeTab} per session.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (activeTab === "TextArea" && textData.trim())
        formData.append("text", textData);
      if (activeTab === "Website" && websiteUrl.trim())
        formData.append("url", websiteUrl);
      if (activeTab === "Upload" && files.length > 0) {
        files.forEach((file) => formData.append("files", file));
      }

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/index`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setResponse(res.data);

      // Update counts and persist
      const newCounts = { ...submittedCount };
      if (activeTab === "TextArea") {
        newCounts.textChars += textData.length;
      } else {
        newCounts[activeTab] = 1;
      }

      setSubmittedCount(newCounts);
      localStorage.setItem("submittedCount", JSON.stringify(newCounts));

      // Reset form state
      setTextData("");
      setWebsiteUrl("");
      setFiles([]);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-hide error/response after 4 seconds
  useEffect(() => {
    if (error || response) {
      const timer = setTimeout(() => {
        setError(null);
        setResponse(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, response]);

  return (
    <div
      className={`h-full flex flex-col ${
        thinking ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <h2 className="mb-3 text-lg font-medium">Data Source</h2>

      <div
        className={`${isSubmitting ? "opacity-50 pointer-events-none" : ""}`}
      >
        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1">
        <div className="flex-1 space-y-4 overflow-y-auto pb-20">
          {activeTab === "TextArea" && (
            <TextArea
              textData={textData}
              setTextData={setTextData}
              isSubmitting={isSubmitting}
              used={submittedCount.textChars}
              MAX_TEXT_CHARS={MAX_TEXT_CHARS}
            />
          )}

          {activeTab === "Upload" && (
            <FIleUpload
              handleFileChange={handleFileChange}
              files={files}
              isSubmitting={isSubmitting}
              file={file}
              setFile={setFile}
            />
          )}

          {activeTab === "Website" && (
            <WebsiteInput
              websiteUrl={websiteUrl}
              setWebsiteUrl={setWebsiteUrl}
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        {error && (
          <div className="mb-3 rounded-md bg-red-100 px-3 py-2 text-sm text-red-600">
            ❌ {error}
          </div>
        )}
        {response && (
          <div className="mb-3 rounded-md bg-green-100 px-3 py-2 text-sm text-green-700">
            ✅ {JSON.stringify(response, null, 2)}
          </div>
        )}

        <div className="sticky bottom-0 left-0 mt-4 pt-5 border-t border-zinc-800">
          {messageCount >= 10 ? (
            <div className="flex items-center justify-center w-full py-5">
              <p className="text-gray-400 text-sm font-medium">
                🚫 Free Limit is expired
              </p>
            </div>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full p-2 rounded-full font-bold text-gray-900 border-[4px] transition-all duration-200 ${
                isSubmitting
                  ? "bg-gray-300 border-gray-400 cursor-not-allowed"
                  : "bg-gray-50 cursor-pointer border-zinc-800 hover:border-zinc-600"
              }`}
            >
              {isSubmitting ? (
                <motion.div
                  className="flex items-center justify-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div className="w-5 h-5 border-4 border-gray-800 border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </motion.div>
              ) : (
                "Submit"
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default IndexForm;
