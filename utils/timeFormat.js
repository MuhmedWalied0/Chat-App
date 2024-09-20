import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';

dayjs.extend(relativeTime);

const formatTime = (timestamp) => {
  return dayjs(timestamp).fromNow();
};

export default formatTime;