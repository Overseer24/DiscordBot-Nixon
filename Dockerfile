# Use an official Node.js image
FROM node:18

# Install FFmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Copy the rest of your bot's code
COPY . .

# Expose the port (optional, if your bot has a web server)
EXPOSE 3000

# Start the bot
CMD ["node", "bot.js"]
