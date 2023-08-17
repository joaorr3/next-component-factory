import cron from "node-cron";

const cronOptions = {
  timezone: "Europe/Lisbon",
};

export const Cron = (interval: string, cb: () => void, id: string) => {
  const tasks = cron.getTasks();
  const task = tasks.get(id);

  if (task) {
    task.stop();
  }

  const job = cron.schedule(interval, cb, { ...cronOptions, name: id });
  job.start();
  return job;
};
