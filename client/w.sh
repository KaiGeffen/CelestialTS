#!/bin/bash
 # Translates all image files in within assets folder into webp format

PARAMS=('-m 6 -q 70 -mt -af -progress')

if [ $# -ne 0 ]; then
	PARAMS=$@;
fi

cd $(pwd)

shopt -s nullglob nocaseglob extglob

for FOLDER in ./assets/**; do
	for FILE in ${FOLDER}/*.@(jpg|jpeg|tif|tiff|png); do
    		cwebp $PARAMS "$FILE" -o "${FILE%.*}".webp;
    		rm "$FILE"
	done
done
