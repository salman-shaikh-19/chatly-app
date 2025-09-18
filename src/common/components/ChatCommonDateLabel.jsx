import dayjs from "dayjs"
import React from "react"
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
dayjs.extend(isToday);
dayjs.extend(isYesterday);
const ChatCommonDateLabel = ({timestamp}) => {
    // console.log(timestamp);
    
    return (
        <>
        <span className="no-search-highlight">
            {dayjs(timestamp).isToday()
                ? "Today"
                : dayjs(timestamp).isYesterday()
                    ? "Yesterday"
                    : dayjs(timestamp).format("MMM D, YYYY")}
                    </span>
        </>
    )
}

export default React.memo(ChatCommonDateLabel)
