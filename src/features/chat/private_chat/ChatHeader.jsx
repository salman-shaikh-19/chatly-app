import { faArrowCircleLeft, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import CommonAvatar from "../../user/components/CommonAvatar";
const ChatHeader = ({ selectedChatUser, onlineUsers, handleDeleteAll,selectedMsgs,handleSelectedDelete, messages, goBack, typing }) => {
    const userId = selectedChatUser?.id;
    return (
        <div

            className="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-gray-300 bg-teal-950"

        >
            <div className="relative w-12 h-12">
               <CommonAvatar
                    avatar={selectedChatUser.avatar}
                    avatarClassName="h-12 w-12"
                    />
                <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2
                 border-white ${onlineUsers.includes(selectedChatUser?.id)
                            ? "bg-green-500" : "bg-gray-400"
                        }`}
                ></span>
            </div>
            <div className="w-full  ">
                <div className="flex justify-between">
                    <span className="block ml-2 font-semibold text-white me-auto">
                        <b>{selectedChatUser.name}</b>
                    </span>
                    {messages.length > 0 && selectedMsgs.length===0 && (
                        <button
                            className="ms-auto p-1 block bg-teal-800 text-white rounded mx-1"
                            onClick={handleDeleteAll}
                            title="Delete all messsage"
                        >
                            <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                    )}
                   
                    {
                        selectedMsgs.length >0 && (
                            <button
                            className=" p-1 block bg-teal-800 text-white rounded mx-1"
                            onClick={handleSelectedDelete}
                            title="Delete selected messages"
                        >
                            <FontAwesomeIcon icon={faTrashAlt} /> ({selectedMsgs.length})
                        </button>
                        ) 
                    }


                    <button
                        onClick={goBack}
                        className="    bg-teal-800 text-white rounded lg:hidden md:hidden"
                    >
                        <FontAwesomeIcon icon={faArrowCircleLeft} size="2x" />
                    </button>
                </div>
                <span className="text-gray-400 mx-2 ">
                    {typing ? `${selectedChatUser.name} Typing.....` : onlineUsers.includes(selectedChatUser.id) ? 'Online' : 'Offline'}</span>
            </div>
        </div>
    )
}

export default React.memo(ChatHeader)
