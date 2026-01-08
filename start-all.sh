#!/bin/bash
# Start the Next.js frontend
cd my-app
npm run dev &
FRONTEND_PID=$!

# Start the Python AI service
cd ../ai-service
source venv/bin/activate
# Try python3 first, then python
if command -v python3 &> /dev/null; then
    echo "Using python3"
    python3 main.py
else
    echo "Using python"
    python main.py
fi

# Wait for frontend to exit
wait $FRONTEND_PID
