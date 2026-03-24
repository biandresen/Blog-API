import logger from "../config/logger.js";

export async function runLoggedJob(jobName, jobFn, meta = {}) {
  const startedAt = Date.now();

  logger.info(
    {
      event: "job_started",
      jobName,
      ...meta,
    },
    `Job started: ${jobName}`
  );

  try {
    const result = await jobFn();
    const durationMs = Date.now() - startedAt;

    logger.info(
      {
        event: "job_succeeded",
        jobName,
        durationMs,
        result,
        ...meta,
      },
      `Job succeeded: ${jobName}`
    );

    return result;
  } catch (error) {
    const durationMs = Date.now() - startedAt;

    logger.error(
      {
        event: "job_failed",
        jobName,
        durationMs,
        ...meta,
        err: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      },
      `Job failed: ${jobName}`
    );

    throw error;
  }
}