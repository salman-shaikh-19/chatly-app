import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React from "react"

const SidebarContentTitle = ({ contentTitle, length, onclick, isExpand }) => {
    return (
        <>
            {length > 0 && (
                <strong onClick={onclick} className="text-gray-700 select-none mb-1 ml-1">

                    <div className="flex items-center gap-1 cursor-pointer">
                        <FontAwesomeIcon
                            icon={isExpand ? faChevronDown : faChevronRight}
                            className="text-gray-600"
                        />
                        <span> {contentTitle}
                            {length > 1 ? "s" : ""}</span>
                    </div>
                </strong>
            )
            }
        </>
    )
}

export default React.memo(SidebarContentTitle)
