import { readFileSync } from "node:fs";
import path from "node:path";
import { CodeBlock } from "./ui";

// Server Component: reads a file from this project at render time and shows it.
// What you see on the page is guaranteed to be the code that actually runs.
// (Only ever pass hard-coded paths here, never user input.)
export function SourceCode({ file }: { file: string }) {
  const code = readFileSync(path.join(process.cwd(), file), "utf8");
  return <CodeBlock title={file} code={code} />;
}
