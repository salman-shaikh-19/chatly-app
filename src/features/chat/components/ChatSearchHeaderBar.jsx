import React, { useState } from "react";
import ChatHeaderAction from "./ChatHeaderAction";
import InChatSearchDropdown from "./InChatSearchDropdown";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const ChatSearchHeaderBar = ({ chatRef }) => {
    const [openSearchModal, setOpenSearchModal] = useState(false);

    const openInChatSearch = () => {
        // console.log('clecked');

        setOpenSearchModal(true);
    }
    const closeInChatSearch = () => {
        setOpenSearchModal(false);
    }
    return (
        <>
            {

                !openSearchModal && (
                    <ChatHeaderAction
                        className="text-lg mr-1"
                        onClick={openInChatSearch}
                        title="Search in chat"
                        icon={faSearch}
                    />
                )
            }

            {
                openSearchModal && <InChatSearchDropdown
                    onClose={closeInChatSearch}
                    chatRef={chatRef}
                />
            }

        </>


    )
}

export default React.memo(ChatSearchHeaderBar);
