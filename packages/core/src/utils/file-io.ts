import { promises as fs } from "fs";

export async function readFileContent(path: string): Promise<string> {
  try {
    return await fs.readFile(path, "utf-8");
  } catch (error) {
    throw new Error(`Failed to read file at ${path}: ${error}`);
  }
}

export async function writeFileContent(path: string, content: string) {
  try {
    await fs.writeFile(path, content, "utf-8");
  } catch (error) {
    throw new Error(`Failed to write file: ${error}`);
  }
}
