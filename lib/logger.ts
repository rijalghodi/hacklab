type LoggerArgs = {
  group: string;
  message: string;
};

const shouldLog = (group: string) => {
  return process.env.LOG_GROUP && process.env.LOG_GROUP?.split(",")?.includes(group);
};

const formatMessage = (group: string, message: string) => {
  return `[${group}] ${message}`;
};

// logger.js
export const logger = {
  info: ({ group, message }: LoggerArgs) => {
    if (shouldLog(group)) {
      console.info(formatMessage(group, message));
    }
  },
  warn: ({ group, message }: LoggerArgs) => {
    if (shouldLog(group)) {
      console.warn(formatMessage(group, message));
    }
  },
  error: ({ group, message }: LoggerArgs) => {
    if (shouldLog(group)) {
      console.error(formatMessage(group, message));
    }
  },
  debug: ({ group, message }: LoggerArgs) => {
    if (shouldLog(group)) {
      console.debug(formatMessage(group, message));
    }
  },
};
