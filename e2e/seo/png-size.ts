/** The width and height of a PNG, read from its IHDR chunk. `undefined` when the bytes are not a PNG. */
export function pngSize(body: Buffer): { width: number; height: number } | undefined {
  const signature = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  if (!body.subarray(0, signature.length).equals(signature)) return undefined;

  return { width: body.readUInt32BE(16), height: body.readUInt32BE(20) };
}
