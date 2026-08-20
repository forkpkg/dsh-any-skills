window.__ModuleLoader__.load({ id: 'dsh-any-skills', factory: (require) => { var module = { exports: {} }; var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// client.ts
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(client_exports);
var import_react = require("react");
var inject = ["slots"];
var NS = "dsh-any-skills";
var API = "/api/skills";
var USAGE_KEY = "dsh-any-skills:usage";
async function api(path, init) {
  const res = await fetch(path, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers ?? {} },
    cache: "no-store"
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || data === null || data.ok !== true) {
    const message = data && typeof data.message === "string" ? data.message : `HTTP ${res.status}`;
    throw new Error(message);
  }
  return data;
}
var apiList = () => api(`${API}/list`);
var apiSources = (cwd) => api(`${API}/sources?cwd=${encodeURIComponent(cwd)}`);
var apiImport = (body) => api(`${API}/import`, { method: "POST", body: JSON.stringify(body) });
var apiInstall = (sources) => api(`${API}/install`, { method: "POST", body: JSON.stringify({ sources }) });
var apiUninstall = (name) => api(`${API}/uninstall`, { method: "DELETE", body: JSON.stringify({ name }) });
var STYLE_ID = "dsh-any-skills-style";
var CSS = [
  ".dsh-as-btn{position:relative;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;flex:none;margin:0 2px;border:1px solid var(--dsw-alias-border-l2,rgba(128,128,128,.28));border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary,#c9d2e0);cursor:pointer;padding:0;transition:background .15s ease,color .15s ease,border-color .15s ease}",
  ".dsh-as-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.1));color:var(--dsw-alias-label-primary,#e6ebf2)}",
  ".dsh-as-btn:disabled{opacity:.45;cursor:not-allowed}",
  ".dsh-as-btn.dsh-as-open{color:var(--dsw-alias-label-primary-bluish,#4cc9f0);border-color:var(--dsw-alias-border-l1,rgba(128,128,128,.4))}",
  ".dsh-as-pop{position:absolute;bottom:calc(100% + 8px);right:0;width:340px;max-height:340px;display:flex;flex-direction:column;background:var(--dsw-specific-tip,#1e2533);border:1px solid var(--dsw-alias-border-l1,rgba(128,128,128,.35));border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,.35);overflow:hidden;z-index:1000}",
  ".dsh-as-search{box-sizing:border-box;width:calc(100% - 16px);margin:8px;padding:6px 10px;border:1px solid var(--dsw-alias-border-l1,rgba(128,128,128,.3));border-radius:8px;background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.1));color:var(--dsw-alias-label-primary,#e6ebf2);font-size:13px;outline:none;flex:none}",
  ".dsh-as-list{overflow-y:auto;flex:auto;padding:0 6px 8px}",
  ".dsh-as-item{display:flex;flex-direction:column;align-items:flex-start;gap:2px;width:100%;padding:7px 10px;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary,#e6ebf2);cursor:pointer;text-align:left}",
  ".dsh-as-item:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12))}",
  ".dsh-as-name{font-family:var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:13px;font-weight:500}",
  ".dsh-as-desc{color:var(--dsw-alias-label-tertiary,#8a94a6);font-size:12px;line-height:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}",
  ".dsh-as-status{padding:12px;color:var(--dsw-alias-label-tertiary,#8a94a6);font-size:13px}",
  ".dsh-as-page{display:grid;gap:18px;width:100%;min-width:0;max-width:780px;padding:6px 0 36px;font-size:14px;line-height:1.55;color:var(--dsw-alias-label-primary,#e6ebf2)}",
  ".dsh-as-card{display:grid;gap:10px;padding:16px;border:1px solid var(--dsw-alias-border-l2,rgba(128,128,128,.22));border-radius:12px;background:var(--dsw-alias-bg-module-platform,transparent)}",
  ".dsh-as-card h3{margin:0;font-size:15px;font-weight:600}",
  ".dsh-as-sub{color:var(--dsw-alias-label-tertiary,#8a94a6);font-size:12.5px;margin:-4px 0 2px}",
  ".dsh-as-row{display:flex;align-items:center;gap:10px;padding:9px 12px;border:1px solid var(--dsw-alias-border-l2,rgba(128,128,128,.16));border-radius:10px;min-width:0}",
  ".dsh-as-row-main{flex:1;min-width:0}",
  ".dsh-as-row-name{font-family:var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
  ".dsh-as-row-desc{color:var(--dsw-alias-label-tertiary,#8a94a6);font-size:12px;line-height:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
  ".dsh-as-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
  ".dsh-as-input{flex:1;min-width:180px;background:var(--dsw-alias-bg-module-platform,#1a1d24);border:1px solid var(--dsw-alias-border-l2,#2a2e38);color:inherit;border-radius:8px;padding:7px 11px;font-size:13px;outline:none}",
  ".dsh-as-input:focus{border-color:var(--dsw-alias-brand-primary,#4f8cff)}",
  ".dsh-as-btn2{display:inline-flex;align-items:center;gap:6px;min-height:30px;padding:0 12px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2,#2a2e38);background:transparent;color:inherit;font-size:12.5px;font-weight:500;cursor:pointer;white-space:nowrap}",
  ".dsh-as-btn2:hover:not(:disabled){border-color:var(--dsw-alias-brand-primary,#4f8cff);color:var(--dsw-alias-brand-primary,#4f8cff)}",
  ".dsh-as-btn2:disabled{opacity:.5;cursor:not-allowed}",
  ".dsh-as-btn2.dsh-as-primary{background:var(--dsw-alias-brand-primary,#4f8cff);border-color:transparent;color:#fff}",
  ".dsh-as-btn2.dsh-as-primary:hover:not(:disabled){background:#3d78e6;color:#fff}",
  ".dsh-as-btn2.dsh-as-danger{color:var(--dsw-alias-danger,#e05c5c)}",
  ".dsh-as-btn2.dsh-as-danger:hover:not(:disabled){border-color:#e05c5c}",
  ".dsh-as-err{display:flex;gap:8px;align-items:center;padding:9px 12px;border-radius:8px;font-size:12.5px;color:#e0a13c;background:rgba(224,161,60,.08);border:1px solid rgba(224,161,60,.3)}",
  ".dsh-as-ok{display:flex;gap:8px;align-items:center;padding:9px 12px;border-radius:8px;font-size:12.5px;color:#7bdca8;background:rgba(123,220,168,.08);border:1px solid rgba(123,220,168,.28)}",
  ".dsh-as-spin{animation:dsh-as-spin .9s linear infinite}",
  "@keyframes dsh-as-spin{to{transform:rotate(360deg)}}"
].join("\n");
function ensureStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID) !== null) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.setAttribute("data-plugin", NS);
  style.textContent = CSS;
  document.head.appendChild(style);
}
function IconBolt(props) {
  return (0, import_react.createElement)(
    "svg",
    {
      width: props.size ?? 16,
      height: props.size ?? 16,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className: props.spin === true ? "dsh-as-spin" : void 0,
      "aria-hidden": true,
      style: { flex: "0 0 auto" }
    },
    (0, import_react.createElement)("path", { d: "M13 2 3 14h9l-1 8 10-12h-9l1-8z" })
  );
}
function IconTrash() {
  return (0, import_react.createElement)(
    "svg",
    { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, style: { flex: "0 0 auto" } },
    (0, import_react.createElement)("path", { d: "M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" })
  );
}
function IconRefresh() {
  return (0, import_react.createElement)(
    "svg",
    { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, style: { flex: "0 0 auto" } },
    (0, import_react.createElement)("path", { d: "M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" })
  );
}
function loadUsage() {
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (raw === null) return {};
    const parsed = JSON.parse(raw);
    return parsed !== null && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
function saveUsage(usage) {
  try {
    localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  } catch {
  }
}
function rankByUsage(skills, usage) {
  return skills.slice().sort((a, b) => {
    const ua = usage[a.name];
    const ub = usage[b.name];
    const la = ua?.lastUsed ?? 0;
    const lb = ub?.lastUsed ?? 0;
    if (la !== lb) return lb - la;
    const ca = ua?.count ?? 0;
    const cb = ub?.count ?? 0;
    if (ca !== cb) return cb - ca;
    return a.name.localeCompare(b.name);
  });
}
function SkillPickerButton(props) {
  const [open, setOpen] = (0, import_react.useState)(false);
  const [skills, setSkills] = (0, import_react.useState)(void 0);
  const [error, setError] = (0, import_react.useState)(void 0);
  const [query, setQuery] = (0, import_react.useState)("");
  const [usage, setUsage] = (0, import_react.useState)(() => loadUsage());
  const boxRef = (0, import_react.useRef)(null);
  const load = (0, import_react.useCallback)(async () => {
    if (skills !== void 0 || error !== void 0) return;
    try {
      const data = await apiList();
      setSkills(data.skills ?? []);
    } catch (cause) {
      setError(messageOf(cause));
    }
  }, [skills, error]);
  const toggle = () => {
    if (!open) void load();
    setOpen((value) => !value);
  };
  const pick = (name) => {
    let draft = "";
    if (props.input !== void 0 && typeof props.input.draft === "string") {
      draft = props.input.draft;
    } else if (typeof props.useInput === "function") {
      try {
        const state = props.useInput((s) => s);
        if (state !== void 0 && typeof state.draft === "string") draft = state.draft;
      } catch {
      }
    }
    const separator = draft === "" || draft.endsWith(" ") || draft.endsWith("\n") ? "" : " ";
    const next = `${draft}${separator}/${name} `;
    try {
      if (typeof props.inputActions?.setDraft === "function") {
        props.inputActions.setDraft(next);
      } else {
        console.warn(`[${NS}] inputActions.setDraft unavailable; draft not written:`, next);
      }
    } catch (cause) {
      console.error(`[${NS}] setDraft failed:`, cause);
    }
    const nextUsage = { ...usage, [name]: { count: (usage[name]?.count ?? 0) + 1, lastUsed: Date.now() } };
    setUsage(nextUsage);
    saveUsage(nextUsage);
    setOpen(false);
    setQuery("");
  };
  (0, import_react.useEffect)(() => {
    if (!open) return;
    const onDown = (event) => {
      if (boxRef.current !== null && event.target instanceof Node && !boxRef.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const ordered = rankByUsage(skills ?? [], usage);
  const q = query.trim().toLowerCase();
  const filtered = ordered.filter((skill) => q === "" || skill.name.toLowerCase().includes(q) || String(skill.description ?? "").toLowerCase().includes(q)).slice(0, 80);
  return (0, import_react.createElement)(
    "div",
    { ref: boxRef, style: { position: "relative", display: "inline-flex", flex: "none" } },
    (0, import_react.createElement)("button", {
      type: "button",
      className: "dsh-as-btn" + (open ? " dsh-as-open" : ""),
      onClick: toggle,
      title: "\u9009\u62E9\u6280\u80FD\uFF08\u63D2\u5165 /\u6280\u80FD\u540D \u5230\u53D1\u9001\u6846\uFF09",
      "aria-label": "\u9009\u62E9\u6280\u80FD",
      "aria-expanded": open
    }, (0, import_react.createElement)(IconBolt, { size: 16 })),
    open ? (0, import_react.createElement)(
      "div",
      { className: "dsh-as-pop", role: "dialog", "aria-label": "\u6280\u80FD\u9009\u62E9" },
      (0, import_react.createElement)("input", {
        className: "dsh-as-search",
        value: query,
        onChange: (event) => setQuery(event.currentTarget.value),
        placeholder: "\u641C\u7D22\u6280\u80FD\u2026",
        autoFocus: true
      }),
      error !== void 0 ? (0, import_react.createElement)("div", { className: "dsh-as-status" }, `\u52A0\u8F7D\u5931\u8D25\uFF1A${error}`) : skills === void 0 ? (0, import_react.createElement)("div", { className: "dsh-as-status" }, "\u52A0\u8F7D\u4E2D\u2026") : (0, import_react.createElement)(
        "div",
        { className: "dsh-as-list" },
        filtered.length === 0 ? (0, import_react.createElement)("div", { className: "dsh-as-status" }, skills.length === 0 ? "\u8FD8\u6CA1\u6709\u5B89\u88C5\u6280\u80FD\u3002\u5230 \u8BBE\u7F6E \u2192 Skill \u7BA1\u7406 \u5BFC\u5165\u3002" : "\u6CA1\u6709\u5339\u914D\u7684\u6280\u80FD") : filtered.map((skill) => (0, import_react.createElement)(
          "button",
          {
            key: skill.name,
            type: "button",
            className: "dsh-as-item",
            onClick: () => pick(skill.name)
          },
          (0, import_react.createElement)("span", { className: "dsh-as-name" }, `/${skill.name}`),
          (0, import_react.createElement)("span", { className: "dsh-as-desc" }, skill.description ?? "")
        ))
      )
    ) : null
  );
}
function SkillsSettingsSection(props) {
  const [installed, setInstalled] = (0, import_react.useState)(null);
  const [installDir, setInstallDir] = (0, import_react.useState)(void 0);
  const [sources, setSources] = (0, import_react.useState)(null);
  const [busy, setBusy] = (0, import_react.useState)(false);
  const [notice, setNotice] = (0, import_react.useState)(void 0);
  const [error, setError] = (0, import_react.useState)(void 0);
  const [localPath, setLocalPath] = (0, import_react.useState)("");
  const [remoteInput, setRemoteInput] = (0, import_react.useState)("");
  const refresh = (0, import_react.useCallback)(async () => {
    setBusy(true);
    setError(void 0);
    try {
      const [list, src] = await Promise.all([apiList(), apiSources("")]);
      setInstalled(list.skills);
      setInstallDir(list.installDir);
      setSources(src.sources);
    } catch (cause) {
      setError(messageOf(cause));
    } finally {
      setBusy(false);
    }
  }, []);
  (0, import_react.useEffect)(() => {
    ensureStyles();
    void refresh();
  }, [refresh]);
  const run = (0, import_react.useCallback)(async (action) => {
    setBusy(true);
    setError(void 0);
    setNotice(void 0);
    try {
      await action();
    } catch (cause) {
      setError(messageOf(cause));
    } finally {
      setBusy(false);
    }
  }, []);
  const uninstall = (name) => run(async () => {
    const result = await apiUninstall(name);
    setNotice(result.message);
    await refresh();
  });
  const importTool = (group) => run(async () => {
    const result = await apiImport({ type: group.tool, sourceId: group.id });
    setNotice(`\u5DF2\u5BFC\u5165 ${result.imported.length} \u4E2A\u6280\u80FD${result.skipped !== void 0 && result.skipped.length > 0 ? `\uFF08${result.skipped.length} \u4E2A\u5DF2\u5B58\u5728\uFF0C\u8DF3\u8FC7\uFF09` : ""}`);
    await refresh();
  });
  const importLocal = () => run(async () => {
    const result = await apiImport({ type: "local", path: localPath.trim() });
    setNotice(`\u5DF2\u5BFC\u5165 ${result.imported.length} \u4E2A\u6280\u80FD`);
    setLocalPath("");
    await refresh();
  });
  const pickLocal = () => run(async () => {
    if (typeof props.pickDirectory !== "function") return;
    const path = await props.pickDirectory();
    if (path !== null && path !== "") {
      const result = await apiImport({ type: "local", path });
      setNotice(`\u5DF2\u5BFC\u5165 ${result.imported.length} \u4E2A\u6280\u80FD`);
      await refresh();
    }
  });
  const installRemote = () => run(async () => {
    const parts = remoteInput.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) {
      setError("\u8BF7\u8F93\u5165 GitHub \u4ED3\u5E93\uFF08owner/repo \u6216 URL\uFF09\u6216 npm \u5305\u540D");
      return;
    }
    const sources2 = parts.map((part) => ({ type: guessSourceType(part), value: part }));
    const result = await apiInstall(sources2);
    const ok = result.results.filter((r) => r.ok);
    const failed = result.results.filter((r) => !r.ok);
    setNotice(
      ok.length > 0 ? `\u5DF2\u5B89\u88C5 ${ok.reduce((n, r) => n + (r.installed?.length ?? 0), 0)} \u4E2A\u6280\u80FD\uFF08${ok.length}/${result.results.length} \u4E2A\u6765\u6E90\u6210\u529F\uFF09` : "\u5B89\u88C5\u5B8C\u6210"
    );
    if (failed.length > 0) {
      setError(failed.map((f) => `${f.source}: ${f.message}`).join("\uFF1B"));
    } else {
      setError(void 0);
    }
    setRemoteInput("");
    await refresh();
  });
  return (0, import_react.createElement)(
    "div",
    { className: "dsh-as-page", "aria-busy": busy },
    (0, import_react.createElement)(
      "header",
      { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" } },
      (0, import_react.createElement)(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        (0, import_react.createElement)("h2", { style: { margin: 0, fontSize: 18, fontWeight: 600 } }, "Skill \u7BA1\u7406"),
        busy ? (0, import_react.createElement)(IconRefresh) : null
      ),
      (0, import_react.createElement)(
        "button",
        { type: "button", className: "dsh-as-btn2", onClick: () => void refresh(), disabled: busy, title: "\u5237\u65B0" },
        (0, import_react.createElement)(IconRefresh),
        "\u5237\u65B0"
      )
    ),
    (0, import_react.createElement)(
      "p",
      { className: "dsh-as-sub", style: { marginTop: -6 } },
      "\u6280\u80FD\u5B58\u653E\u4E8E ~/.dsh/skills\uFF0C\u6A21\u578B\u53EF\u81EA\u52A8\u8BFB\u53D6\uFF1B\u5728\u5BF9\u8BDD\u6846\u65C1\u70B9\u51FB \u26A1 \u6309\u94AE\u53EF\u63D2\u5165 /\u6280\u80FD\u540D \u8C03\u7528\u3002"
    ),
    error !== void 0 ? (0, import_react.createElement)("div", { className: "dsh-as-err", role: "alert" }, error) : null,
    notice !== void 0 ? (0, import_react.createElement)("div", { className: "dsh-as-ok", role: "status" }, notice) : null,
    (0, import_react.createElement)(
      "section",
      { className: "dsh-as-card" },
      (0, import_react.createElement)("h3", null, "\u5DF2\u5B89\u88C5\u6280\u80FD"),
      (0, import_react.createElement)("p", { className: "dsh-as-sub" }, `\u5B89\u88C5\u76EE\u5F55\uFF1A${installDir ?? "\u2026"}`),
      installed === null ? (0, import_react.createElement)("p", { className: "dsh-as-status" }, "\u6B63\u5728\u8BFB\u53D6\u2026") : installed.length === 0 ? (0, import_react.createElement)("p", { className: "dsh-as-status" }, "\u8FD8\u6CA1\u6709\u5B89\u88C5\u4EFB\u4F55\u6280\u80FD\u3002") : (0, import_react.createElement)(
        "div",
        { style: { display: "grid", gap: 8 } },
        installed.map((skill) => (0, import_react.createElement)(
          "div",
          { key: skill.name, className: "dsh-as-row" },
          (0, import_react.createElement)(
            "div",
            { className: "dsh-as-row-main" },
            (0, import_react.createElement)("div", { className: "dsh-as-row-name" }, `/${skill.name}`),
            (0, import_react.createElement)("div", { className: "dsh-as-row-desc" }, skill.description || "(\u65E0\u63CF\u8FF0)")
          ),
          (0, import_react.createElement)("button", {
            type: "button",
            className: "dsh-as-btn2 dsh-as-danger",
            disabled: busy,
            onClick: () => void uninstall(skill.name),
            title: `\u5378\u8F7D ${skill.name}`,
            "aria-label": `\u5378\u8F7D ${skill.name}`
          }, (0, import_react.createElement)(IconTrash), "\u5378\u8F7D")
        ))
      )
    ),
    (0, import_react.createElement)(
      "section",
      { className: "dsh-as-card" },
      (0, import_react.createElement)("h3", null, "\u5BFC\u5165"),
      (0, import_react.createElement)("p", { className: "dsh-as-sub" }, "\u4ECE Codex / Claude Code / OpenCode \u6216\u672C\u673A\u76EE\u5F55\u590D\u5236\u6280\u80FD\u5230 ~/.dsh/skills\u3002"),
      sources === null ? (0, import_react.createElement)("p", { className: "dsh-as-status" }, "\u6B63\u5728\u626B\u63CF\u6765\u6E90\u2026") : (0, import_react.createElement)(
        "div",
        { style: { display: "grid", gap: 8 } },
        sources.filter((s) => s.exists || s.skills.length > 0).map((group) => (0, import_react.createElement)(
          "div",
          { key: group.id, className: "dsh-as-row" },
          (0, import_react.createElement)(
            "div",
            { className: "dsh-as-row-main" },
            (0, import_react.createElement)("div", { className: "dsh-as-row-name" }, group.label),
            (0, import_react.createElement)(
              "div",
              { className: "dsh-as-row-desc" },
              group.skills.length > 0 ? group.skills.map((s) => `${s.name}${s.installed === true ? " \u2713" : ""}`).join("\u3001") : "\u672A\u627E\u5230\u6280\u80FD"
            )
          ),
          (0, import_react.createElement)("button", {
            type: "button",
            className: "dsh-as-btn2 dsh-as-primary",
            disabled: busy || group.skills.length === 0,
            onClick: () => void importTool(group),
            title: group.skills.length === 0 ? "\u8BE5\u76EE\u5F55\u4E0B\u6CA1\u6709\u6280\u80FD" : `\u5BFC\u5165 ${group.label} \u7684\u6280\u80FD`
          }, (0, import_react.createElement)(IconBolt, { size: 12 }), "\u5BFC\u5165")
        ))
      ),
      (0, import_react.createElement)(
        "div",
        { className: "dsh-as-toolbar" },
        (0, import_react.createElement)("input", {
          className: "dsh-as-input",
          value: localPath,
          onChange: (event) => setLocalPath(event.currentTarget.value),
          placeholder: "\u672C\u673A\u76EE\u5F55\u8DEF\u5F84\uFF08\u542B SKILL.md \u6216\u6280\u80FD\u6587\u4EF6\uFF09",
          "aria-label": "\u672C\u673A\u76EE\u5F55\u8DEF\u5F84"
        }),
        typeof props.pickDirectory === "function" ? (0, import_react.createElement)("button", { type: "button", className: "dsh-as-btn2", disabled: busy, onClick: () => void pickLocal() }, "\u9009\u62E9\u76EE\u5F55") : null,
        (0, import_react.createElement)("button", {
          type: "button",
          className: "dsh-as-btn2 dsh-as-primary",
          disabled: busy || localPath.trim() === "",
          onClick: () => void importLocal()
        }, "\u5BFC\u5165")
      )
    ),
    (0, import_react.createElement)(
      "section",
      { className: "dsh-as-card" },
      (0, import_react.createElement)("h3", null, "\u5B89\u88C5"),
      (0, import_react.createElement)("p", { className: "dsh-as-sub" }, "\u4ECE GitHub \u6216 npm \u5B89\u88C5\uFF08\u652F\u6301\u6279\u91CF\uFF0C\u7528\u7A7A\u683C/\u9017\u53F7/\u5206\u53F7\u5206\u9694\uFF09\u3002"),
      (0, import_react.createElement)(
        "div",
        { className: "dsh-as-toolbar" },
        (0, import_react.createElement)("input", {
          className: "dsh-as-input",
          value: remoteInput,
          onChange: (event) => setRemoteInput(event.currentTarget.value),
          placeholder: "owner/repo \u6216 https://github.com/... \u6216 npm \u5305\u540D\uFF0C\u591A\u4E2A\u7528\u7A7A\u683C\u5206\u9694",
          "aria-label": "GitHub \u4ED3\u5E93\u6216 npm \u5305\u540D"
        }),
        (0, import_react.createElement)("button", {
          type: "button",
          className: "dsh-as-btn2 dsh-as-primary",
          disabled: busy || remoteInput.trim() === "",
          onClick: () => void installRemote()
        }, "\u5B89\u88C5")
      )
    )
  );
}
function guessSourceType(value) {
  const s = value.trim();
  if (s.includes("/") || s.startsWith("git@") || /^https?:\/\/github\.com\//i.test(s)) return "github";
  return "npm";
}
function apply(ctx) {
  ensureStyles();
  const slots = ctx.slots;
  if (slots === void 0) {
    console.warn(`[${NS}] slots service unavailable; skipping UI registration`);
    return;
  }
  const workspaces = ctx.get?.("workspaces");
  ctx.effect?.(
    () => slots.inject(
      "conversation.input.right",
      () => slots.register(
        { name: "conversation.input.right", id: "any-skills-picker", order: 100, label: "Skill picker" },
        SkillPickerButton
      )
    ),
    `${NS}: composer skill picker`
  );
  ctx.effect?.(
    () => slots.inject(
      "settings.section",
      () => slots.register(
        {
          name: "settings.section",
          id: "skills",
          order: 35,
          label: "Skill \u7BA1\u7406",
          inject: () => ({ pickDirectory: workspaces?.pickDirectory })
        },
        SkillsSettingsSection
      )
    ),
    `${NS}: settings section`
  );
}
function messageOf(reason) {
  return reason instanceof Error ? reason.message : String(reason);
}
return module.exports; } });
