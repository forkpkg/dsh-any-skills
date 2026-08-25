# dsh-any-skills

> Import, install, and invoke Agent Skills in [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) from **Codex / Claude Code / OpenCode / GitHub / npm** - with a ⚡ composer-side skill picker and a **Skill Management** settings page.
>
> Import and install Agent Skills from Codex / Claude Code / OpenCode / GitHub / npm to `~/.dsh/skills`; support one-click insertion of `/skill-name` next to the dialog, and provide a comprehensive skill management interface in the settings page.

![dsh-plugin](https://img.shields.io/badge/dsh-plugin-%40deepseek--ai%2Fdsh-blue) ![license](https://img.shields.io/badge/license-MIT-green)

## Features

- **Import Skills**
  - Codex: `~/.codex/skills`, project `.codex/skills`
  - Claude Code: `~/.claude/skills`, project `.claude/skills`
  - OpenCode: project `.opencode/skills`, `.agents/skills`
  - GitHub repository: `owner/repo`, HTTPS URL, SSH URL (`git@github.com:...`), Git URL (`ssh://git@github.com/...`)
  - Local directory: any directory containing `SKILL.md` or `.md` skill files
- **Install Skills**
  - GitHub: download codeload tarball and extract (see `dsh-skill-market` implementation, no Git binary required)
  - npm: resolve package tarball via registry API and extract
  - Supports bulk installation (space / comma / semicolon separated)
- **Invoke in Conversation**
  - Composer side ⚡ button -> opens searchable skill list -> inserts `/skill-name` into input
- **Settings Page**: `Settings -> Skill Management` lists installed skills, allows uninstalling, source importing, and GitHub/npm installation

All imported/installed skills are written to `~/.dsh/skills/` (configurable). This is the native skill provider (`dsh-skill-filesystem`) root directory, automatically watched - **no extra registration needed**. The model can read new skills immediately, and the `/skill-name` gesture is available.

## Installation

```bash
# Install from Git online (recommended, tested):
 dsh plugin --profile web add "github:wmengxiang/dsh-any-skills#main"
```

```bash
# Or install from the plugin source directory (checked out repo) to the web profile:
 cd dsh-any-skills
 dsh plugin --profile web add .
 # dsh will automatically add the package with dsh.bundle.patch into dsh.profile.bundles layer
```

Restart `dsh web` after installing.

> **Note:** The `missing peer @deepseek-ai/cordis@^4.0.1` warning during installation is normal - it matches other dsh plugins (dshmarket, dsh-at-file, etc.). Cordis is provided by DSH itself; no separate install required. `Ignored build scripts: esbuild` is harmless: the repo is already built.

## Usage

### 1. Composer ⚡ Skill Picker

There is a ⚡ button beside the conversation input:

1. Click it to open the skill picker, showing all installed skills in `~/.dsh/skills` (name + description)
2. Search box filters by name/description, with recent usage priority
3. Selecting a skill automatically inserts `/skill-name` with a space into the input; sending the message will load the skill.

### 2. Settings Page Skill Management

`Settings -> Skill Management`:

- **⚡ Button Switch**: enable/disable the ⚡ button next to the conversation input (default on; can still use `/skill-name` directly when off)
- **Installed Skills**: lists all installed skills, each can be uninstalled (moves to `.trash-\u003ctimestamp\u003e-\u003cname\u003e`, can be restored manually). After uninstalling, the UI shows the trash directory name, a restore button, and a manual `mv` command.
- **Import**: automatically detects user- and project-level Codex/Claude Code/OpenCode skill directories. Each line shows absolute path and number of skills. Click to expand to view skill details (name/description/path/installed flag). Supports importing all skills at once or a single skill. Also supports importing from a local directory.
- **Install**: input GitHub repository (`owner/repo` or full URL) or npm package name, supports bulk. During installation the button is disabled and shows a loading animation to prevent duplicate actions.

### 3. HTTP API

The host registers same-origin JSON APIs on dsh webServer (the browser UI calls these):

| Method | Path | Body | Description |
| --- | --- | --- | --- |
| GET | `/api/skills/list` | - | List installed skills |
| GET | `/api/skills/sources?cwd=...` | - | Detect Codex/Claude/OpenCode importable skills |
| POST | `/api/skills/import` | `{type, path?, repository?, sourceId?, cwd?, names?}` | Import (`type: codex/claude/opencode/local/github`; `names` can import specific skills) |
| POST | `/api/skills/install` | `{sources: [{type: 'github'|'npm', value}]}` | Bulk install |
| DELETE | `/api/skills/uninstall` | `{name}` | Uninstall (returns `trash` directory name; moves to .trash) |
| POST | `/api/skills/restore` | `{name, trash}` | Restore from .trash |

Same-origin checking is applied.

## Skill Format

Import requires the same format as the native dsh format:

```
\u003cskill-name\u003e/
|-- SKILL.md
```

`SKILL.md` must start with YAML front matter, at least containing:

```markdown
---
name: my-skill          # must match ^[a-z0-9]+(?:-[a-z0-9]+)*$ (kebab-case)
description: One sentence description
---
Skill body ...
```

- Flat format `\u003cskill-name\u003e.md` is also supported.
- During import, the name is normalized to kebab-case (uppercase to lowercase, underscore to hyphen, etc.).
- Optional front matter fields: `whenToUse`, `disable-model-invocation`, `user-invocable`, `metadata`.

## Configuration

Override plugin configuration via `cordis.patch.yml` in the profile:

```yaml
- config:
    - id: dsh-any-skills
      config:
        installDir: /path/to/custom/skills   # default ~/.dsh/skills
        githubToken: ''                       # optional: GitHub API token
        githubTokenFile: ''                   # optional: token file path (or use env GITHUB_TOKEN)
```

## Development & Testing

```bash
pnpm install          # install devDependencies
pnpm typecheck        # tsc --noEmit
pnpm test             # build + node --test (16 unit tests: frontmatter, name, repo parsing, fs flow, API, client bundle)
pnpm build            # esbuild: index.js (Host ESM) + client.js (Client CJS + __ModuleLoader__ handshake)
```

### Development Test

```bash
# Attach to the profile then start dev overlay:
 dsh plugin --profile web add .
 dsh web --patch ./cordis.dev.yml
```

### Project Structure

```
dsh-any-skills/
|-- package.json          # dsh.bundle.patch + dsh.client declaration
|-- cordis.patch.yml      # patch insertion of plugin line
|-- cordis.dev.yml        # dev overlay
|-- build.mjs             # esbuild build script
|-- index.ts              # Host: /api/skills/* routes + skill management logic
|-- client.ts             # Client: ⚡ button + skill picker + Skill Management UI
|-- src/
|   |-- skills.ts         # core: front matter parsing, name normalization, scan/copy/uninstall
|   |-- remote.ts         # GitHub/npm tarball parsing & installation
|-- test/                 # node:test unit tests
```

## Reference Implementations

- [dsh-skills-manager](https://github.com/Xichun123/dsh-skills-manager) - settings sidebar + composer wrench UI
- [dsh-skill-market](https://github.com/QQ-M/dsh-skill-market) - GitHub tarball installer to `~/.dsh/skills`
- [dsh-skill-picker](https://github.com/a735624258/dsh-skill-picker) - composer side searchable picker

## FAQ

**Unable to see new skills after import/installation?**

`~/.dsh/skills` is watched by the native dsh skill provider (`dsh-skill-filesystem`). No restart is required; in rare cases you may need to wait 1-2 seconds or start a fresh session.

**⚡ Button disappeared?**

`Settings -> Skill Management -> Show ⚡ button next to the conversation input` was turned off; toggle it on.

When off, you can still manually call skills with `/skill-name`.

**Accidentally uninstalled a skill? How to recover?**

The skill moves to `~/.dsh/skills/.trash-\u003ctimestamp\u003e-\u003cname\u003e`. You can click the restore button, or run:

```
mv ~/.dsh/skills/.trash-\u003ctimestamp\u003e-\u003cname\u003e ~/.dsh/skills/\u003cname\u003e
```

**`missing peer @deepseek-ai/cordis` warning on install?**

It's normal; all dsh plugins share this. Cordis is bundled by DSH itself; no separate install needed.

**How to update the plugin to the latest version?**

```bash
 dsh plugin --profile web update dsh-any-skills
```

## License

MIT
