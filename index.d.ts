export const name: string
export const inject: string[]
export interface Config {
  /** Directory where imported/installed skills land. Defaults to ~/.dsh/skills. */
  installDir?: string
  /** Optional GitHub token to lift API rate limits (used for repo inspection). */
  githubToken?: string
  /** Optional path to a file containing a GitHub token. */
  githubTokenFile?: string
}
export function apply(ctx: any, config?: Config): void
