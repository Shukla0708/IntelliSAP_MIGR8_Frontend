const STORAGE_KEY = "migr8.trackedJobs";

export type TrackedJobKind = "validation" | "comparison";

export type TrackedJob = {
  kind: TrackedJobKind;
  id: string;
};

function readJobs(): TrackedJob[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TrackedJob[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (job) =>
        job &&
        (job.kind === "validation" || job.kind === "comparison") &&
        typeof job.id === "string",
    );
  } catch {
    return [];
  }
}

function writeJobs(jobs: TrackedJob[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

export function trackJob(job: TrackedJob) {
  const jobs = readJobs().filter(
    (item) => !(item.kind === job.kind && item.id === job.id),
  );
  jobs.push(job);
  writeJobs(jobs);
}

export function untrackJob(job: TrackedJob) {
  writeJobs(
    readJobs().filter((item) => !(item.kind === job.kind && item.id === job.id)),
  );
}

export function listTrackedJobs(): TrackedJob[] {
  return readJobs();
}

export function resultPathForJob(job: TrackedJob): string {
  return job.kind === "validation"
    ? `/validation_result/${job.id}`
    : `/compare/${job.id}`;
}

export function isJobResultPath(pathname: string, job: TrackedJob): boolean {
  return pathname === resultPathForJob(job) || pathname.startsWith(`${resultPathForJob(job)}/`);
}
