interface EnsureGitignoreConfig {
  patterns?: string[];
  comment?: string;
  filepath?: string;
  dryRun?: boolean;
}

declare const _default: ({
  patterns,
  comment,
  filepath,
  dryRun,
}: EnsureGitignoreConfig) => Promise<string>;

export default _default;
