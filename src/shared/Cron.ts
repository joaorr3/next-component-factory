import cron, { type ScheduleOptions } from "node-cron";
import logger from "./logger";

const cronOptions: Omit<ScheduleOptions, "name" | "runOnInit"> = {
  timezone: "Europe/Lisbon",
  scheduled: true,
};

export const Cron = (
  interval: string,
  cb: () => void,
  id: string,
  runOnInit = false
) => {
  const tasks = cron.getTasks();
  const task = tasks.get(id);

  if (task) {
    task.stop();
  }

  const event = () => {
    logger.console.server({
      level: "info",
      message: `Cron ${id}:`,
    });
    cb();
  };

  const job = cron.schedule(interval, event, {
    ...cronOptions,
    name: id,
    runOnInit,
  });
  job.start();
  return job;
};
