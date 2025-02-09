# Build stage for frontend
FROM node:20-slim AS frontend-build

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app/client

# Copy frontend files
COPY client/package.json client/pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of the frontend code
COPY client/ .

# Build frontend
RUN pnpm build

# Final stage
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements and install
COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy server code and .env file
COPY server/ .

# Copy built frontend from previous stage to Flask's static folder
COPY --from=frontend-build /app/client/dist/ ./static/

# Set environment variables
ENV FLASK_APP=main.py
ENV FLASK_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Run with Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "main:app"]