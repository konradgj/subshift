import { describe, it, expect, afterAll, vi } from "vitest";
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

  it("throws for missing file", async () => {
    await expect(
      readFileContent("definitely-not-there.srt")
    ).rejects.toThrowError(/Failed to read file/);
  });

  it("should throw an error when fs.writeFile rejects", async () => {
    const mockError = new Error("Disk full");
    const mockWrite = vi.spyOn(fs, "writeFile").mockRejectedValue(mockError);
    const filePath = "/path/to/file.srt";
    const content = "Subtitle content";

    await expect(writeFileContent(filePath, content)).rejects.toThrow(
      `Failed to write file: ${mockError}`
    );

    mockWrite.mockRestore();
  });

  afterAll(async () => {
    try {
      await fs.unlink(tmpFile);
    } catch {
      /* empty */
    }
  });
});
