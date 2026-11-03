import struct
import zlib
import os

def make_png(width, height, color):
    row = b'\x00' + bytes(color) * width
    raw_data = row * height
    compressed_data = zlib.compress(raw_data)
    
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', compressed_data) + chunk(b'IEND', b'')

os.makedirs('assets', exist_ok=True)
# #2563eb is RGB (37, 99, 235)
with open('assets/icon-192.png', 'wb') as f:
    f.write(make_png(192, 192, (37, 99, 235)))

with open('assets/icon-512.png', 'wb') as f:
    f.write(make_png(512, 512, (37, 99, 235)))

print("Generated PWA icons successfully.")
