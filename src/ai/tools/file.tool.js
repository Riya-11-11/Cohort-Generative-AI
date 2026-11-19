import { tool } from "langchain";
import * as z from "zod";
import fs from "fs/promises";

/**
 * Create or update multiple files at once (create one if not existed
 */

export const upsertFiles = tool(
  async function ({ files }) {
    await Promise.all(
      files.map(async (file) => {
        return await fs.writeFile(file.path, file.content);
      }),
    );
    return "file created successfully";
  },
  {
    name: "upsertFiles",
    description:
      "Create/ Update multiple files at once (create oone if not existed)",
    schema: z.object({
      files: z.array(
        z.object({
          path: z
            .string()
            .describe("Absolute path of the file to be created/update"),
          content: z
            .string()
            .describe("Conteent of the file to be created/update"),
        }),
      ),
    }),
  },
);

/**
 * List all folders (recursively) and files in a directory (ignore folders like node_modules, .git, .vscode)
 */

export const listFiles = tool(
  async function ({ folder }) {
    const results = [];
    async function traverse(currentFolder) {
      const entries = await fs.readdir(currentFolder, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = `${currentFolder}/${entry.name}`;
        if (entry.isDirectory()) {
          if (!["node_modules", ".git", ".vscode"].includes(entry.name)) {
            await traverse(fullPath);
          }
        } else {
          results.push(fullPath);
        }
      }
    }
    await traverse(folder);
    return JSON.stringify(results);
  },
  {
    name: "listFiles",
    description:
      "List all folders (recursively) and files in a directory (ignore folders like node_modules, .git, .vscode)",
    schema: z.object({
      folder: z.string().describe("Absolute path of the folder to be listed"),
    }),
  },
);

/**
 * Read multiple files at once
 */

export const readFiles = tool(
  async function ({ files }) {
    const results = await Promise.all(
      files.map(async (file) => {
        const content = await fs.readFile(file.path, "utf-8");
        return {
          path: file.path,
          content: content,
        };
      }),
    );
    return JSON.stringify(results);
  },
  {
    name: "readFiles",
    description: "Read multiple files at once",
    schema: z.object({
      files: z.array(
        z.object({
          path: z.string().describe("Absolute path of the file to be read"),
        }),
      ),
    }),
  },
);
