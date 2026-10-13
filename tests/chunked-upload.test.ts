import { MAX_UPLOAD_SIZE, UPLOAD_CHUNK_SIZE } from "../lib/chunked-upload-constants";
import {
  cancelChunkedUpload,
  finishChunkedUpload,
  startChunkedUpload,
  writeUploadChunk,
} from "../lib/server/chunked-upload";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

async function withUploadRoot(run: (root: string) => Promise<void>) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "idt-photo-upload-"));
  try {
    await run(root);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}

function webpBytes(size: number) {
  const bytes = Buffer.alloc(size, 42);
  bytes.write("RIFF", 0, "ascii");
  bytes.write("WEBP", 8, "ascii");
  return bytes;
}

test("reassembles chunks exactly and publishes the finished image", async () => {
  await withUploadRoot(async (root) => {
    const bytes = webpBytes(UPLOAD_CHUNK_SIZE + 17);
    const { id, chunkSize } = await startChunkedUpload(root, "user-1", bytes.length);
    assert.equal(chunkSize, UPLOAD_CHUNK_SIZE);

    await writeUploadChunk(root, "user-1", id, 0, bytes.subarray(0, chunkSize));
    await writeUploadChunk(root, "user-1", id, 0, bytes.subarray(0, chunkSize));
    await writeUploadChunk(root, "user-1", id, 1, bytes.subarray(chunkSize));

    const result = await finishChunkedUpload(root, "user-1", id);
    assert.equal(result.path, `/uploads/${id}.webp`);
    assert.deepEqual(
      await fs.readFile(path.join(root, "public", result.path)),
      bytes
    );
    await assert.rejects(finishChunkedUpload(root, "user-1", id), {
      status: 404,
    });
  });
});

test("does not publish an incomplete upload and allows completion after the missing chunk", async () => {
  await withUploadRoot(async (root) => {
    const bytes = webpBytes(UPLOAD_CHUNK_SIZE + 5);
    const { id } = await startChunkedUpload(root, "user-1", bytes.length);
    await writeUploadChunk(root, "user-1", id, 0, bytes.subarray(0, UPLOAD_CHUNK_SIZE));

    await assert.rejects(finishChunkedUpload(root, "user-1", id), {
      status: 409,
    });
    await assert.rejects(
      fs.access(path.join(root, "public", "uploads", `${id}.webp`)),
      { code: "ENOENT" }
    );

    await writeUploadChunk(root, "user-1", id, 1, bytes.subarray(UPLOAD_CHUNK_SIZE));
    await finishChunkedUpload(root, "user-1", id);
  });
});

test("rejects wrong owners, invalid chunks and non-WebP data", async () => {
  await withUploadRoot(async (root) => {
    const bytes = webpBytes(20);
    const { id } = await startChunkedUpload(root, "user-1", bytes.length);
    await assert.rejects(writeUploadChunk(root, "user-2", id, 0, bytes), {
      status: 404,
    });
    await assert.rejects(writeUploadChunk(root, "user-1", id, 0, bytes.subarray(0, 19)), {
      status: 400,
    });
    await assert.rejects(writeUploadChunk(root, "user-1", id, 1, bytes), {
      status: 400,
    });
    await writeUploadChunk(root, "user-1", id, 0, bytes);
    await assert.rejects(writeUploadChunk(root, "user-1", id, 0, Buffer.alloc(20)), {
      status: 409,
    });
    await cancelChunkedUpload(root, "user-1", id);

    const invalid = await startChunkedUpload(root, "user-1", 20);
    await writeUploadChunk(root, "user-1", invalid.id, 0, Buffer.alloc(20));
    await assert.rejects(finishChunkedUpload(root, "user-1", invalid.id), {
      status: 400,
    });
  });
});

test("enforces a file size limit before creating a session", async () => {
  await withUploadRoot(async (root) => {
    await assert.rejects(startChunkedUpload(root, "user-1", MAX_UPLOAD_SIZE + 1), {
      status: 400,
    });
    await assert.rejects(startChunkedUpload(root, "user-1", 0), {
      status: 400,
    });
  });
});

test("removes abandoned sessions when the owner starts another upload", async () => {
  await withUploadRoot(async (root) => {
    const { id } = await startChunkedUpload(root, "user-1", 20);
    const stagingRoot = path.join(root, ".upload-staging");
    const [owner] = await fs.readdir(stagingRoot);
    const oldDirectory = path.join(stagingRoot, owner, id);
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    await fs.utimes(oldDirectory, twoDaysAgo, twoDaysAgo);

    await startChunkedUpload(root, "user-1", 20);
    await assert.rejects(fs.access(oldDirectory), { code: "ENOENT" });
  });
});
