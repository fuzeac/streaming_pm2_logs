// Import necessary modules
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const { Tail } = require('tail');
const dotenv = require('dotenv');
const fs = require('fs');
const os = require('os');
const path = require('path');
const os = require('os-utils');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app and create an HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.io server
const io = new Server(server);

// Serve the static index.html file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// An array to hold our tail instances
const tails = [];
// A buffer to hold log lines
let logBuffer = {};

// Function to resolve tilde paths
const resolvePath = (filepath) => {
  if (filepath[0] === '~') {
    return path.join(os.homedir(), filepath.slice(1));
  }
  return filepath;
};

// Read log file paths from environment variables
// Example format in .env: LOG_FILES=sub1-out.log,sub2-out.log
const logFilesFromEnv = process.env.LOG_FILES;
if (!logFilesFromEnv) {
  console.error("No LOG_FILES found in .env file. Please add them.");
  process.exit(1);
}
const logFilePaths = logFilesFromEnv.split(',').map(file => file.trim());

// Initialize tail for each log file
logFilePaths.forEach(logFile => {
  const fullPath = resolvePath(logFile);
  console.log(`Attempting to tail file: ${fullPath}`);

  if (fs.existsSync(fullPath)) {
    try {
      const tail = new Tail(fullPath);
      const fileName = path.basename(logFile);
      logBuffer[fileName] = [];

      tail.on("line", function(data) {
        // Add log line to the buffer for the specific file
        logBuffer[fileName].push(data);
      });

      tail.on("error", function(error) {
        console.error(`ERROR tailing ${fileName}: `, error);
      });

      tails.push(tail);
      console.log(`Tailing ${fileName}`);
    } catch (error) {
        console.error(`Failed to initiate tail for ${fullPath}:`, error);
    }
  } else {
    console.warn(`Log file not found: ${fullPath}`);
  }
});

// Send buffered logs to clients every 2 seconds
setInterval(() => {
  // Check if there are any connected sockets
  if (io.engine.clientsCount > 0) {
    for (const fileName in logBuffer) {
      if (logBuffer[fileName].length > 0) {
        // Emit the logs for each file
        io.emit('log', { file: fileName, data: logBuffer[fileName].join('\n') + '\n' });
        // Clear the buffer after sending
        logBuffer[fileName] = [];
      }
    }
  }
}, 2000); // Interval of 2 seconds


// Add this setInterval to emit stats every second
setInterval(() => {
  // Get CPU usage (this is an async call)
  os.cpuUsage(function(v){
    const cpuUsage = (v * 100).toFixed(2); // Format to 2 decimal places
    const freeMem = (os.freememPercentage() * 100).toFixed(2);
    const totalMem = (os.totalmem() / 1024).toFixed(2); // In GB

    // Emit stats to all connected clients
    io.emit('stats', {
      cpu: cpuUsage,
      mem: {
        free: freeMem,
        total: totalMem
      }
    });
  });
}, 800); // Send stats every 1 second

// Handle new socket connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on *:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Stopping server...');
  tails.forEach(tail => tail.unwatch());
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});
