import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React from "react"
import { useSelector } from "react-redux";

const SidebarContentTitle = ({ contentTitle, length, onclick, isExpand }) => {
    const theme = useSelector((state) => state.common.theme || "light");
    return (
        <>
            {length > 0 && (
                <strong onClick={onclick}  className={`text-gray-700 select-none mb-1 ml-1 cursor-pointer `}>

                    <div className="flex items-center gap-1 cursor-pointer" >
                        <FontAwesomeIcon
                            icon={isExpand ? faChevronDown : faChevronRight}
                            className={` ${theme === "dark" ? "text-gray-300" : "text-gray-700"} text-sm`}
                            
                        />
                        <span className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`} title={isExpand ? `Collapse ${contentTitle}` : `Expand ${contentTitle}`}> {contentTitle}
                            {length > 1 ? "s" : ""}
                             <span className={`ml-1 text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>({length})</span>
                            </span>
                    </div>
                </strong>
            )
            }
        </>
    )
}

export default React.memo(SidebarContentTitle)
