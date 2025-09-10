import React from "react"

const SidebarContentTitle = ({ contentTitle, length }) => {
    return (
        <>
            {length > 0 && (
                <strong className="text-gray-700 mb-1 ml-1">
                    {contentTitle}
                    {length > 1 ? "s" : ""}
                </strong>
            )
            }
        </>
    )
}

export default React.memo(SidebarContentTitle)
