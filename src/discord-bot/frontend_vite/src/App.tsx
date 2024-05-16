import React from "react";
import "./App.css";
import type { CronJob, CronJobBodySchema } from "../../router/cronJobs";
import type { DataExchangeBodySchema } from "../../router/dataExchange";
import type { DiscordBotAction } from "../../router/discordBot";

const createDataExchangePayload = (options: DataExchangeBodySchema) => {
  return JSON.stringify(options);
};
const createCronJobPayload = (options: CronJobBodySchema) => {
  return JSON.stringify(options);
};

export const App = () => {
  return (
    <div>
      <Jobs />
      <hr />
      <DataExchange />
      <hr />
      <DiscordBot />
    </div>
  );
};

const Jobs = () => {
  const [jobs, setJobs] = React.useState<CronJob[]>([]);
  const [selectedJob, setSelectedJob] = React.useState<string>();
  const inputJobIntervalRef = React.useRef<HTMLInputElement>(null);
  const inputJobRunOnInitRef = React.useRef<HTMLInputElement>(null);

  const [jobDetails, setJobDetails] = React.useState<{
    interval: string;
    eventsCount: number;
    options: Record<string, any>;
  }>();

  React.useEffect(() => {
    getJobs();
  }, []);

  const getJobs = () => {
    fetch("cron-jobs/list")
      .then((res) => res.json())
      .then((data) => {
        setJobs(data);
      });
  };

  const getJob = (id: string) => {
    fetch(`cron-jobs/list/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setJobDetails(data);
      });
  };

  const handleJob = (options: CronJobBodySchema) => {
    fetch(`cron-jobs/update/${selectedJob}`, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: createCronJobPayload(options),
    })
      .then((res) => res.json())
      .then((data) => {
        setJobDetails(data);
      });
  };

  React.useEffect(() => {
    if (selectedJob) {
      getJob(selectedJob);
    } else {
      setJobDetails(undefined);
    }
  }, [selectedJob]);

  return (
    <div className="card">
      <h4>Cron Jobs</h4>

      <pre>{JSON.stringify(jobDetails, undefined, 2)}</pre>
      <select
        name="cron-jobs"
        onChange={(e) => {
          setSelectedJob(e.target.value);
        }}
      >
        <option key="null" value="" selected>
          - select -
        </option>
        {jobs.map((job) => {
          return (
            <option key={job.id} value={job.id}>
              {job.id}
            </option>
          );
        })}
      </select>

      {selectedJob && (
        <React.Fragment>
          <button onClick={() => handleJob({ action: "start" })}>Start</button>
          <button onClick={() => handleJob({ action: "stop" })}>Stop</button>

          <div style={{ display: "flex", gap: 16 }}>
            <input ref={inputJobIntervalRef} type="text" name="poll-time" />
            <button
              onClick={() =>
                handleJob({
                  interval: inputJobIntervalRef.current?.value,
                  runOnInit: inputJobRunOnInitRef.current?.checked,
                })
              }
            >
              Update Schedule
            </button>

            <input
              ref={inputJobRunOnInitRef}
              type="checkbox"
              name="run-on-init"
            />
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

const DataExchange = () => {
  const [status, setStatus] = React.useState<string>();
  const interval = React.useRef<NodeJS.Timer>();

  const inputPollTimeRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    getStatus();

    interval.current = setInterval(() => {
      getStatus();
    }, 5_000);

    return () => {
      clearInterval(interval.current);
    };
  }, []);

  const getStatus = () => {
    fetch("data-exchange/status")
      .then((res) => res.json())
      .then((data) => {
        setStatus(data);
      });
  };

  const setOptions = (options: DataExchangeBodySchema) => {
    fetch("data-exchange/set", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: createDataExchangePayload(options),
    })
      .then((res) => res.json())
      .then((data) => {
        setStatus(data);
      });
  };

  const handleSetPollTime = () => {
    const value = inputPollTimeRef.current?.value;

    if (value) {
      setOptions({
        pollTime: value,
      });
    }
  };

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column" }}>
      <h4>Data Exchange</h4>
      <pre>{JSON.stringify(status, undefined, 2)}</pre>

      <div style={{ display: "flex" }}>
        <button onClick={getStatus}>Get Status</button>
      </div>

      <div style={{ display: "flex" }}>
        <button onClick={() => setOptions({ action: "start" })}>Start</button>
        <button onClick={() => setOptions({ action: "stop" })}>Stop</button>
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        <input ref={inputPollTimeRef} type="text" name="poll-time" />
        <button onClick={handleSetPollTime}>Update Poll time</button>
      </div>
    </div>
  );
};

const DiscordBot = () => {
  const [status, setStatus] = React.useState<string>();

  React.useEffect(() => {
    getStatus();
  }, []);

  const getStatus = () => {
    fetch("discord-bot")
      .then((res) => res.json())
      .then((data) => {
        setStatus(data);
      });
  };

  const setBotState = (action: DiscordBotAction) => {
    fetch(`discord-bot/${action}`)
      .then((res) => res.json())
      .then((data) => {
        setStatus(data);
      });
  };

  return (
    <div className="card">
      <h4>Discord Bot</h4>
      <div style={{ display: "flex" }}>
        <button onClick={() => setBotState("start")}>Start</button>
        <button onClick={() => setBotState("destroy")}>Destroy</button>
      </div>

      <pre>{JSON.stringify(status, undefined, 2)}</pre>
    </div>
  );
};
