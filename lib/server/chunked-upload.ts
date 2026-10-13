import { MAX_UPLOAD_SIZE, UPLOAD_CHUNK_SIZE } from "@/lib/chunked-upload-constants";
import { createHash, randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

const SESSION_LIFETIME_MS = 24 * 60 * 60 * 1000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Session = { size: number };

export class UploadError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

function sessionDirectory(root: string, userId: string, id: string) {
  if (!UUID_PATTERN.test(id)) throw new UploadError("Invalid upload ID", 400);
  const owner = createHash("sha256").update(userId).digest("hex");
  return path.join(root, ".upload-staging", owner, id);
}

async function getSession(root: string, userId: string, id: string) {
  const directory = sessionDirectory(root, userId, id);
  try {
    const session = JSON.parse(
      await fs.readFile(path.join(directory, "session.json"), "utf8")
    ) as Session;
    if (
      !Number.isSafeInteger(session.size) ||
      session.size < 1 ||
      session.size > MAX_UPLOAD_SIZE
    ) {
      throw new UploadError("Invalid upload session", 400);
    }
    return { directory, session };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new UploadError("Upload session not found", 404);
    }
    throw error;
  }
}

async function removeExpiredSessions(ownerDirectory: string) {
  const entries = await fs.readdir(ownerDirectory, { withFileTypes: true });
  const now = Date.now();
  for (const entry of entries) {
    if (!entry.isDirectory() || !UUID_PATTERN.test(entry.name)) continue;
    const directory = path.join(ownerDirectory, entry.name);
    const stat = await fs.stat(directory);
    if (now - stat.mtimeMs > SESSION_LIFETIME_MS) {
      await fs.rm(directory, { recursive: true, force: true });
    }
  }
}

export async function startChunkedUpload(root: string, userId: string, size: number) {
  if (!Number.isSafeInteger(size) || size < 1 || size > MAX_UPLOAD_SIZE) {
    throw new UploadError("Invalid image size", 400);
  }

  const id = randomUUID();
  const directory = sessionDirectory(root, userId, id);
  const ownerDirectory = path.dirname(directory);
  await fs.mkdir(ownerDirectory, { recursive: true });
  await removeExpiredSessions(ownerDirectory);
  await fs.mkdir(directory);
  await fs.writeFile(path.join(directory, "session.json"), JSON.stringify({ size }));
  return { id, chunkSize: UPLOAD_CHUNK_SIZE };
}

export async function writeUploadChunk(
  root: string,
  userId: string,
  id: string,
  index: number,
  data: Buffer
) {
  const { directory, session } = await getSession(root, userId, id);
  const chunkCount = Math.ceil(session.size / UPLOAD_CHUNK_SIZE);
  if (!Number.isSafeInteger(index) || index < 0 || index >= chunkCount) {
    throw new UploadError("Invalid chunk index", 400);
  }
  const expectedSize = Math.min(
    UPLOAD_CHUNK_SIZE,
    session.size - index * UPLOAD_CHUNK_SIZE
  );
  if (data.length !== expectedSize) {
    throw new UploadError("Invalid chunk size", 400);
  }

  const chunkPath = path.join(directory, `${index}.chunk`);
  try {
    await fs.writeFile(chunkPath, data, { flag: "wx" });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    const existing = await fs.readFile(chunkPath);
    if (!existing.equals(data)) {
      throw new UploadError("Chunk already contains different data", 409);
    }
  }
}

export async function finishChunkedUpload(root: string, userId: string, id: string) {
  const { directory, session } = await getSession(root, userId, id);
  const chunkCount = Math.ceil(session.size / UPLOAD_CHUNK_SIZE);
  const assembledPath = path.join(directory, "assembled.webp");
  const outputDirectory = path.join(root, "public", "uploads");
  const outputPath = path.join(outputDirectory, `${id}.webp`);
  let handle: fs.FileHandle | undefined;

  try {
    handle = await fs.open(assembledPath, "wx");
    let totalSize = 0;
    for (let index = 0; index < chunkCount; index++) {
      let chunk: Buffer;
      try {
        chunk = await fs.readFile(path.join(directory, `${index}.chunk`));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          throw new UploadError("Upload is incomplete", 409);
        }
        throw error;
      }
      const expectedSize = Math.min(
        UPLOAD_CHUNK_SIZE,
        session.size - index * UPLOAD_CHUNK_SIZE
      );
      if (chunk.length !== expectedSize) {
        throw new UploadError("A chunk has the wrong size", 409);
      }
      if (
        index === 0 &&
        (chunk.toString("ascii", 0, 4) !== "RIFF" ||
          chunk.toString("ascii", 8, 12) !== "WEBP")
      ) {
        throw new UploadError("Invalid WebP image", 400);
      }
      await handle.writeFile(chunk);
      totalSize += chunk.length;
    }
    if (totalSize !== session.size) {
      throw new UploadError("Upload size mismatch", 409);
    }
    await handle.close();
    handle = undefined;
    await fs.mkdir(outputDirectory, { recursive: true });
    await fs.rename(assembledPath, outputPath);
    await fs.rm(directory, { recursive: true, force: true });
    return { path: `/uploads/${id}.webp` };
  } catch (error) {
    await handle?.close();
    await fs.rm(assembledPath, { force: true });
    throw error;
  }
}

export async function cancelChunkedUpload(root: string, userId: string, id: string) {
  const directory = sessionDirectory(root, userId, id);
  await fs.rm(directory, { recursive: true, force: true });
}
