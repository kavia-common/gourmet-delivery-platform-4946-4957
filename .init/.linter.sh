#!/bin/bash
cd /home/kavia/workspace/code-generation/gourmet-delivery-platform-4946-4957/react_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

