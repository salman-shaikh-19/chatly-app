import { faArrowCircleLeft, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import CommonAvatar from "../../user/components/CommonAvatar";
import ChatHeaderAction from "../components/ChatHeaderAction";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import getLastSeenText from "../../../common/utils/getLastSeen";


const ChatHeader = ({ selectedChatUser, onlineUsers, handleDeleteAll, selectedMsgs, handleSelectedDelete, messages, goBack, typing }) => {
    const userId = selectedChatUser?.id;
    const {lastSeen} =useSelector(state=>state.common);
    return (
        <div className="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-gray-300 bg-teal-950"
        >
            <div className="relative w-12 h-12">
                <CommonAvatar
                    avatar={selectedChatUser.avatar}
                    avatarClassName="h-12 w-12 "
                />
                <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2
                 border-white ${onlineUsers.includes(selectedChatUser?.id)
                            ? "bg-green-500" : "bg-gray-400"
                        }`}
                ></span>
            </div>
            <div className="w-full  ">
                <div className="flex justify-between flex-row items-center ">
                    <span className="block ml-2  font-semibold text-white me-auto">
                        <b>{selectedChatUser.name}</b>
                    </span>
                    <div className="flex ">
                    {messages.length > 0 && selectedMsgs.length === 0 && (
                        <ChatHeaderAction
                          className="text-xs "
                            icon={faTrashAlt}
                            onClick={handleDeleteAll}
                            title="Delete all messages"
                        />
                    )}

                    {
                        selectedMsgs.length > 0 && (
                            <ChatHeaderAction
                             className="text-xs"
                                icon={faTrashAlt}
                                onClick={handleSelectedDelete}
                                title="Delete selected messages"
                            >
                                ({selectedMsgs.length})
                            </ChatHeaderAction>
                        )
                    }


                    <ChatHeaderAction
                        className="ms-1 lg:hidden md:hidden  "
                        onClick={goBack}
                        title="back to user list"
                        icon={faArrowCircleLeft}
                    />
                    </div>
                </div>
                <span className="text-gray-400 mx-2 select-none   text-xs ">
                    {typing ? `${selectedChatUser.name} Typing.....` : onlineUsers.includes(selectedChatUser.id) ? 'Online' : lastSeen?.[selectedChatUser?.id]
                        ? <span className=""> last seen {getLastSeenText(lastSeen[selectedChatUser.id])}</span>
                        : 'Offline'}</span>
            </div>
        </div>
    )
}

export default React.memo(ChatHeader)
