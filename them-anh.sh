#!/bin/bash
# =========================================================
#  THÊM ẢNH VÀO ALBUM
#  1. Chép ảnh (jpg, jpeg, png, heic) vào thư mục ima/
#  2. Chạy:  ./them-anh.sh
#  Script sẽ nén ảnh vào ima/album/, tạo ảnh nhỏ ima/album/thumb/
#  và cập nhật js/gallery.js. Ảnh xếp theo tên file (đặt tên 01-, 02-... để sắp thứ tự).
#  Xoá ảnh trong ima/ rồi chạy lại thì ảnh cũng bị gỡ khỏi album.
# =========================================================
cd "$(dirname "$0")" || exit 1
SRC="ima"
OUT="ima/album"
mkdir -p "$OUT/thumb"
shopt -s nullglob nocaseglob

added=0
for f in "$SRC"/*.{jpg,jpeg,png,heic}; do
  name=$(basename "${f%.*}")
  out="$OUT/$name.jpg"
  if [ ! -f "$out" ] || [ "$f" -nt "$out" ]; then
    sips -s format jpeg -s formatOptions 80 -Z 1600 "$f" --out "$out" >/dev/null 2>&1 &&
    sips -s format jpeg -s formatOptions 70 -Z 640 "$f" --out "$OUT/thumb/$name.jpg" >/dev/null 2>&1 &&
    { echo "  + $name"; added=$((added + 1)); }
  fi
done

# Gỡ ảnh không còn ảnh gốc
removed=0
for a in "$OUT"/*.jpg; do
  name=$(basename "${a%.*}")
  found=""
  for f in "$SRC/$name".*; do found=1; done
  if [ -z "$found" ]; then
    rm -f "$a" "$OUT/thumb/$name.jpg"; echo "  - $name"; removed=$((removed + 1))
  fi
done

# Tạo danh sách album
count=0
{
  echo "/* Tự tạo bởi them-anh.sh — không cần sửa tay */"
  echo "window.WEDDING_GALLERY = ["
  for a in "$OUT"/*.jpg; do
    n=$(basename "$a")
    w=$(sips -g pixelWidth "$a" | awk '/pixelWidth/{print $2}')
    h=$(sips -g pixelHeight "$a" | awk '/pixelHeight/{print $2}')
    n_js=${n//\\/\\\\}; n_js=${n_js//\"/\\\"}
    echo "  { src: \"$OUT/$n_js\", thumb: \"$OUT/thumb/$n_js\", w: $w, h: $h },"
    count=$((count + 1))
  done
  echo "];"
} > js/gallery.js

echo "Xong! Thêm $added, gỡ $removed. Album hiện có $count ảnh."
