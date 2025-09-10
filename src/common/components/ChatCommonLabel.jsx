import { uniqueId } from "lodash";
import React from "react";

const ChatCommonLabel = ({ children }) => {
  const id = uniqueId("chat-label-");
  // console.log(id);
   
  return (
    <span id={id} className="text-gray-500 my-2 px-3 py-1 rounded-md bg-white">
      {children}
    </span>
  );
};

export default React.memo(ChatCommonLabel);
