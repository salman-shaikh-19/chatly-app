import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

function getLastSeenText(time) {
  const diffSeconds = dayjs().diff(dayjs(time), 'second');

  if (diffSeconds < 10)
  {
    return 'just now'; // within 10 seconds
  }
  if (diffSeconds < 60)
  {
    return `${diffSeconds} seconds ago`;  // return 'few seconds ago';
  }
   
  if (dayjs(time).isToday()) {
    return `today at ${dayjs(time).format('h:mm A')}`;
  }
//   if (diffSeconds < 3600) return dayjs(time).fromNow(); // minutes ago
//   if (diffSeconds < 86400) return dayjs(time).fromNow(); // hours ago

  if (dayjs(time).isYesterday()) {
    return `yesterday at ${dayjs(time).format('h:mm A')}`;
  }

  if (diffSeconds < 604800) 
  {
    return `${dayjs(time).format('dddd at h:mm A')}`; // this week like Monday at 3:00 PM
  }
  if (diffSeconds < 2419200)
  {

    return `${dayjs(time).format('MMM D at h:mm A')}`; // last week like sep 10 at 3:00 PM
  }
   
  //
  if (diffSeconds < 2592000)
  {
    return `last month`; // last seen last month like 3 weeks ago
  }
  return `${dayjs(time).format('MMM D, YYYY')}`; // older than a month like sep 10, 2022
}

export default getLastSeenText;
