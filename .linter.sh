#!/bin/bash
cd /home/kavia/workspace/code-generation/learnpath-ai-30889-201ffda2/learnpath_ai
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

