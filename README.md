# **Simple PM2 Real-Time Log Streamer**

This project provides a web-based, real-time log viewer for multiple PM2 processes. It uses Node.js, Express, and Socket.io to stream log files to a web interface. It's designed to be lightweight and prevent server overload by buffering log updates.

## **Features**

* **Real-time Log Streaming**: View logs from multiple files as they are updated.  
* **Multi-File Support**: Configure as many log files as you need.  
* **CPU and Memory Protection**: Buffers log data and sends it in batches to prevent excessive resource usage.  
* **Easy Configuration**: All configuration is done in a .env file.  
* **Simple Web Interface**: Clean and simple UI to view the log streams.

## **Setup and Installation**

### **1\. Prerequisites**

* [Node.js](https://nodejs.org/) (v14 or later)  
* [npm](https://www.npmjs.com/)  
* [PM2](https://pm2.keymetrics.io/) installed and running your processes.

### **2\. Clone the Repository**

If this were a git repository, you would clone it. For now, just save the files I've provided into a new directory.

### **3\. Install Dependencies**

Navigate to your project directory in the terminal and run:

npm install

This will install all the necessary packages defined in package.json.

### **4\. Configure Log Files**

Create a .env file in the root of your project directory. Open it and add the paths to your PM2 log files. The paths should be comma-separated.

LOG\_FILES=\~/.pm2/logs/sub1-out.log,\~/.pm2/logs/sub2-out.log

You can add up to 10 (or more) log files. The \~ character is supported and will be resolved to your home directory.

You can also change the default port if needed:

PORT=4000

### **5\. Run the Application**

You can run the server directly with Node.js:

node server.js

For production, it's recommended to run the log streamer itself with PM2:

pm2 start server.js \--name log-streamer

### **6\. View the Logs**

Open your web browser and navigate to http://localhost:3000 (or the port you specified in your .env file). You should see the logs from your configured files streaming in real-time.
