import { describe, it, expect, afterAll } from "vitest";
import {
  readFileContent,
  writeFileContent,
} from "../../../packages/core/src/utils/file-io";
import { promises as fs } from "fs";
import path from "path";

describe("file-io", () => {
  const tmpFile = path.join(__dirname, "temp.test.srt");

  it("writes then reads correctly", async () => {
    const text = "Hello from integration!";
    await writeFileContent(tmpFile, text);

    const read = await readFileContent(tmpFile);
    expect(read).toBe(text);
  });

  it("returns null for missing file", async () => {
    const read = await readFileContent("definitely-not-there.srt");
    expect(read).toBeNull();
  });

  afterAll(async () => {
    try {
      await fs.unlink(tmpFile);
    } catch {
      /* empty */
    }
  });
});
