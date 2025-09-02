import React, { useRef, useState, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSmile, faClose } from "@fortawesome/free-solid-svg-icons";

const ChatInputBar = ({  onSend, handleTyping, editMsg, onClearEdit }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [messageText, setMessageText] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (editMsg) {
      setMessageText(editMsg.message);
      inputRef.current?.focus();
    }
  }, [editMsg]);

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
    <div className="p-2 border-t border-teal-950 flex items-center gap-2">
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
            <div className="custom-emoji-picker">
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

      <input
        ref={inputRef}
        type="text"
        value={messageText}
        onChange={(e) => {
          setMessageText(e.target.value);
          handleTyping();
        }}
        placeholder="Type a message..."
        className="flex-1 border-0 border-b-2 border-teal-850 focus:border-teal-950 focus:ring-0 outline-none p-2"
      />

      <button
        onClick={handleSendClick}
        className="bg-teal-950 text-white px-4 py-2 rounded"
      >
        {editMsg ? "Update" : "Send"}
      </button>
    </div>
  );
};

export default React.memo(ChatInputBar);
