import { faBan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import React from "react";

const ChatMessageContent = ({ msg }) => {
    const msgDate = dayjs(msg.timestamp);
    return (
        <>
        <div className="text-left">
          {msg.isDeleted ? (
            <span className="italic text-gray-400">
              <FontAwesomeIcon icon={faBan} className="mr-1" /> Message has been deleted
            </span>
          ) : (
            msg.message
          )}
        </div>

        <div className="no-search-highlight  text-xs text-gray-400 mt-1 text-right">
          {msgDate.format("hh:mm A")}
          {msg.updatedAt && !msg.isDeleted && " (edited)"}
        </div>
        </>
    );
}

export default React.memo(ChatMessageContent);
