export type StudioProjectPayload = {
  name?: string;
  prompt?: string;
  settings?: Record<string, unknown>;
  timeline?: Array<Record<string, unknown>>;
  audio?: Array<Record<string, unknown>>;
  outputs?: Array<Record<string, unknown>>;
};

