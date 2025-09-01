import { promises as fs } from "fs";
import path from "path";

export async function readFileContent(path: string): Promise<string> {
  try {
    return await fs.readFile(path, "utf-8");
  } catch (error) {
    throw new Error(`Failed to read file at ${path}: ${error}`);
  }
}

export async function writeFileContent(filePath: string, content: string) {
  try {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, content, "utf-8");
  } catch (error) {
    throw new Error(`Failed to write file: ${error}`);
  }
}
