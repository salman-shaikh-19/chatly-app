import { uniqueId } from "lodash";
import React from "react";
import { useSelector } from "react-redux";

const ChatCommonLabel = ({ children }) => {
  const theme=useSelector(state=>state.common.theme);
  const id = uniqueId("chat-label-");
  // console.log(id);
   
  return (
    <span id={id} className={` no-search-highlight ${theme=='dark'?'text-gray-200 bg-gray-900':'text-gray-500 bg-white'} select-none my-2 px-3 py-1 rounded-md `}>
      {children}
    </span>
  );
};

export default React.memo(ChatCommonLabel);
