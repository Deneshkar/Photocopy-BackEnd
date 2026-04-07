const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "..");
const excludedDirs = new Set(["node_modules", "uploads"]);

function collectJsFiles(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (excludedDirs.has(entry.name)) {
        return [];
      }

      return collectJsFiles(fullPath);
    }

    return entry.isFile() && entry.name.endsWith(".js") ? [fullPath] : [];
  });
}

const filesToCheck = collectJsFiles(projectRoot);

for (const filePath of filesToCheck) {
  const result = spawnSync(process.execPath, ["--check", filePath], {
    encoding: "utf8",
  });

  if (result.status !== 0) {
    process.stdout.write(result.stdout || "");
    process.stderr.write(result.stderr || "");
    process.exit(result.status || 1);
  }
}

console.log(`Syntax check passed for ${filesToCheck.length} files.`);
