#!/bin/sh
# Encodes the reel for the web from the master export.
#
#   sh scripts/encode-reel.sh path/to/studio-reel-v2.mp4
#
# Needs an ffmpeg build with libx264, libvpx-vp9, libopus, libwebp and zimg
# (zscale), such as the static builds from johnvansickle.com. Set FFMPEG to use
# a binary that isn't on your PATH.
#
# Writes public/reel/:
#   reel-1080.mp4     1920x1080, 60 fps, H.264 High 4.2, AAC 128k. Tablets and desktops.
#   reel-720.mp4      1280x720, 30 fps, H.264 High 3.1, AAC 128k. Phones.
#   reel-720.webm     1280x720, 30 fps, VP9 and Opus. Only for browsers without H.264.
#   poster-960.webp, poster-1920.webp   the first frame, shown until the video plays.
#
# The master is full-range BT.601. The encodes are converted to limited-range
# BT.709 and tagged, so browsers show the same colours as the rest of the page.
# zscale does the conversion because ffmpeg's default scaler rounds the
# near-black background a few levels too dark.
# If the codec level changes, update the codecs strings in src/components/Reel.astro.
set -eu

SRC=${1:?usage: sh scripts/encode-reel.sh path/to/master.mp4}
FF=${FFMPEG:-ffmpeg}
OUT=$(dirname "$0")/../public/reel
mkdir -p "$OUT"

IN="rangein=full:matrixin=470bg:primariesin=709:transferin=709:primaries=709:transfer=709"
TO709="filter=lanczos:$IN:range=limited:matrix=709"
TAGS="-color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv"

# 1080p keeps the master's 60 fps: the UI motion is smoother and it costs about 20% more.
$FF -hide_banner -loglevel error -y -i "$SRC" \
  -vf "zscale=w=1920:h=1080:$TO709,format=yuv420p" \
  -c:v libx264 -preset veryslow -crf 23 -profile:v high -level:v 4.2 -maxrate 6M -bufsize 12M $TAGS \
  -c:a aac -b:a 128k -ar 48000 -ac 2 \
  -movflags +faststart "$OUT/reel-1080.mp4"

$FF -hide_banner -loglevel error -y -i "$SRC" \
  -vf "fps=30,zscale=w=1280:h=720:$TO709,format=yuv420p" \
  -c:v libx264 -preset veryslow -crf 23 -profile:v high -level:v 3.1 -maxrate 3M -bufsize 6M $TAGS \
  -c:a aac -b:a 128k -ar 48000 -ac 2 \
  -movflags +faststart "$OUT/reel-720.mp4"

PASSLOG=$(mktemp -u)
$FF -hide_banner -loglevel error -y -i "$SRC" \
  -vf "fps=30,zscale=w=1280:h=720:$TO709,format=yuv420p" \
  -c:v libvpx-vp9 -b:v 0 -crf 34 -row-mt 1 -tile-columns 2 -deadline good -cpu-used 1 $TAGS \
  -pass 1 -passlogfile "$PASSLOG" -an -f null /dev/null
$FF -hide_banner -loglevel error -y -i "$SRC" \
  -vf "fps=30,zscale=w=1280:h=720:$TO709,format=yuv420p" \
  -c:v libvpx-vp9 -b:v 0 -crf 34 -row-mt 1 -tile-columns 2 -deadline good -cpu-used 1 $TAGS \
  -pass 2 -passlogfile "$PASSLOG" \
  -c:a libopus -b:a 96k "$OUT/reel-720.webm"
rm -f "$PASSLOG"-*.log

# Posters: the first frame. WebP stores limited-range BT.601, so it gets that directly.
for W in 960 1920; do
  $FF -hide_banner -loglevel error -y -i "$SRC" -frames:v 1 \
    -vf "zscale=w=$W:h=$((W * 9 / 16)):filter=lanczos:$IN:range=limited:matrix=470bg,format=yuv420p" \
    -c:v libwebp -quality 90 -compression_level 6 -preset drawing "$OUT/poster-$W.webp"
done

ls -l "$OUT"
