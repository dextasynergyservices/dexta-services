import { Buffer } from "node:buffer";
import { deflateRawSync } from "node:zlib";

type ZipEntry = {
  path: string;
  data: Buffer;
};

type PreparedZipEntry = ZipEntry & {
  compressedData: Buffer;
  compressionMethod: 0 | 8;
};

const crcTable = new Uint32Array(256);

for (let i = 0; i < 256; i += 1) {
  let value = i;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  crcTable[i] = value >>> 0;
}

function crc32(buffer: Buffer) {
  let value = 0xffffffff;

  for (const byte of buffer) {
    value = crcTable[(value ^ byte) & 0xff] ^ (value >>> 8);
  }

  return (value ^ 0xffffffff) >>> 0;
}

function getDosDateTime(date = new Date()) {
  const year = Math.max(date.getFullYear(), 1980);
  const dosTime =
    (date.getHours() << 11) |
    (date.getMinutes() << 5) |
    Math.floor(date.getSeconds() / 2);
  const dosDate =
    ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();

  return { dosDate, dosTime };
}

function writeUInt16(value: number) {
  const buffer = Buffer.allocUnsafe(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function writeUInt32(value: number) {
  const buffer = Buffer.allocUnsafe(4);
  buffer.writeUInt32LE(value >>> 0);
  return buffer;
}

function normalizeZipPath(filePath: string) {
  return filePath
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .split("/")
    .filter(Boolean)
    .join("/");
}

export function createZipArchive(
  entries: Array<{ path: string; data: Buffer | string }>,
) {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  const { dosDate, dosTime } = getDosDateTime();
  let offset = 0;

  const normalizedEntries: ZipEntry[] = entries
    .map((entry) => ({
      path: normalizeZipPath(entry.path),
      data: Buffer.isBuffer(entry.data)
        ? entry.data
        : Buffer.from(entry.data, "utf8"),
    }))
    .filter((entry) => entry.path && !entry.path.endsWith("/"));

  const preparedEntries: PreparedZipEntry[] = normalizedEntries.map((entry) => {
    const compressedData = deflateRawSync(entry.data, { level: 9 });

    if (compressedData.length >= entry.data.length) {
      return {
        ...entry,
        compressedData: entry.data,
        compressionMethod: 0,
      };
    }

    return {
      ...entry,
      compressedData,
      compressionMethod: 8,
    };
  });

  for (const entry of preparedEntries) {
    const fileName = Buffer.from(entry.path, "utf8");
    const checksum = crc32(entry.data);
    const compressedSize = entry.compressedData.length;
    const uncompressedSize = entry.data.length;
    const localHeader = Buffer.concat([
      writeUInt32(0x04034b50),
      writeUInt16(20),
      writeUInt16(0),
      writeUInt16(entry.compressionMethod),
      writeUInt16(dosTime),
      writeUInt16(dosDate),
      writeUInt32(checksum),
      writeUInt32(compressedSize),
      writeUInt32(uncompressedSize),
      writeUInt16(fileName.length),
      writeUInt16(0),
      fileName,
    ]);

    localParts.push(localHeader, entry.compressedData);

    centralParts.push(
      Buffer.concat([
        writeUInt32(0x02014b50),
        writeUInt16(20),
        writeUInt16(20),
        writeUInt16(0),
        writeUInt16(entry.compressionMethod),
        writeUInt16(dosTime),
        writeUInt16(dosDate),
        writeUInt32(checksum),
        writeUInt32(compressedSize),
        writeUInt32(uncompressedSize),
        writeUInt16(fileName.length),
        writeUInt16(0),
        writeUInt16(0),
        writeUInt16(0),
        writeUInt16(0),
        writeUInt32(0),
        writeUInt32(offset),
        fileName,
      ]),
    );

    offset += localHeader.length + entry.compressedData.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const endOfCentralDirectory = Buffer.concat([
    writeUInt32(0x06054b50),
    writeUInt16(0),
    writeUInt16(0),
    writeUInt16(normalizedEntries.length),
    writeUInt16(normalizedEntries.length),
    writeUInt32(centralDirectory.length),
    writeUInt32(offset),
    writeUInt16(0),
  ]);

  return Buffer.concat([
    ...localParts,
    centralDirectory,
    endOfCentralDirectory,
  ]);
}
