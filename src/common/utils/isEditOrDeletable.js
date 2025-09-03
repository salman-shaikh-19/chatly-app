import dayjs from "dayjs";

const isEditOrDeletable = (timestamp) => {
    // console.log('timestamp:'+timestamp);

    const now = dayjs();
    const diffInMinutes = now.diff(dayjs(timestamp), "minute");
    // console.log('diff:'+diffInMinutes);
    
    return diffInMinutes < 2; //will return true/false
}

export default isEditOrDeletable
