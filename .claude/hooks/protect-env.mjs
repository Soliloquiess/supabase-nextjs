// PreToolUse 훅: .env / .env.local 등 비밀 파일의 직접 편집(Write/Edit)을 차단한다.
// .env.example 은 허용. stdin으로 들어오는 tool 입력 JSON에서 file_path를 확인한다.
import { readFileSync } from "node:fs";

let raw = "";
try {
  raw = readFileSync(0, "utf8");
} catch {
  raw = "";
}

let data = {};
try {
  data = JSON.parse(raw || "{}");
} catch {
  data = {};
}

const filePath = data?.tool_input?.file_path ?? "";
const isEnv = /(^|[\\/])\.env(\.[^\\/]*)?$/.test(filePath);
const isExample = /\.env\.example$/.test(filePath);

if (isEnv && !isExample) {
  console.error(
    "🚫 .env 비밀 파일 직접 편집이 차단되었습니다. .env.local 은 수동으로 관리하고, " +
      "변수 안내는 .env.example 에 작성하세요.",
  );
  process.exit(2); // exit 2 = 도구 호출 차단 (stderr가 Claude에게 전달됨)
}

process.exit(0);
