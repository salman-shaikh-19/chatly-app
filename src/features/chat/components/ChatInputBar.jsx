import React, { useRef, useState, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSmile, faClose, faPaperPlane, faCheck } from "@fortawesome/free-solid-svg-icons";

const ChatInputBar = ({  onSend, handleTyping, editMsg, onClearEdit }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [messageText, setMessageText] = useState("");
  const inputRef = useRef(null);
  const pickerRef = useRef(null);

  useEffect(() => {
    if (editMsg) {
      setMessageText(editMsg.message);
      inputRef.current?.focus();
    }
  }, [editMsg]);
  // close picker on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    if (showPicker) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showPicker]);


  const handleSendClick = () => {
    if (!messageText.trim()) return;
    onSend(messageText);
    setMessageText("");
    onClearEdit?.();
  };

  const onEmojiClick = (emojiData) => {
    setMessageText(prev => prev + emojiData.emoji);
    handleTyping();
    inputRef.current?.focus();
  };

  return (
    <div className="p-2 border-t border-teal-950 bg-white flex items-center gap-2">
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowPicker(prev => !prev)}
          className="p-2 text-xl"
        >
          <FontAwesomeIcon icon={faSmile} className="text-teal-950" />
        </button>
        {showPicker && (
          <div className="absolute bottom-20 left-0 z-50 bg-white border rounded shadow-lg">
            <div className="flex justify-end p-1 border-b">
              <button
                onClick={() => setShowPicker(false)}
                className="text-gray-600 hover:text-gray-900 font-bold"
              >
                <FontAwesomeIcon icon={faClose} />
              </button>
            </div>
            <div ref={pickerRef} className="custom-emoji-picker">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                width={270}
                height={300}
                emojiStyle="apple"
                previewConfig={{ showPreview: false }}
              />
            </div>
          </div>
        )}
      </div>

      <textarea
        ref={inputRef}
        value={messageText}
        onChange={(e) => {
          setMessageText(e.target.value);
          handleTyping();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendClick();
          }
        }}
        placeholder="Type a message..."
        rows={1}
        className="flex-1 border-0 border-b-2 border-teal-850 focus:border-teal-950 focus:ring-0 outline-none p-2 resize-none"
        style={{
          overflowY: "scroll",
          scrollbarWidth: "none", /* fire foxc */
          msOverflowStyle: "none" /* Internet exploere 10+ */
        }}
      />



      <button
        onClick={handleSendClick}
        className={`bg-teal-950 text-white px-4 py-2  rounded`}
      >
        {editMsg ? <FontAwesomeIcon icon={faCheck} /> :<FontAwesomeIcon icon={faPaperPlane} className="rotate-45" />}
      </button>
    </div>
  );
};

export default React.memo(ChatInputBar);
