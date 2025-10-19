type LoggerArgs = {
  group: string;
  message?: string;
  data?: any;
};

const shouldLog = (group: string) => {
  return !process.env.LOG_GROUP || process.env.LOG_GROUP?.split(",")?.includes(group);
};

const formatMessage = (group: string, message?: string) => {
  return `[${group}] ${message}`;
};

// logger.js
export const logger = {
  info: ({ group, message, data }: LoggerArgs) => {
    if (shouldLog(group)) {
      console.info(formatMessage(group, message), data);
    }
  },
  warn: ({ group, message, data }: LoggerArgs) => {
    if (shouldLog(group)) {
      console.warn(formatMessage(group, message), data);
    }
  },
  error: ({ group, message, data }: LoggerArgs) => {
    if (shouldLog(group)) {
      console.error(formatMessage(group, message), data);
    }
  },
  debug: ({ group, message, data }: LoggerArgs) => {
    if (shouldLog(group)) {
      console.debug(formatMessage(group, message), data);
    }
  },
};
