# Use an official Node.js image
FROM node:latest

# Install FFmpeg
RUN apt-get update && apt-get install -y ffmpeg


# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of your bot's code
COPY . .

# Expose port (optional, but useful for debugging)
EXPOSE 3000

# Start the bot
CMD ["node", "index.js"]
