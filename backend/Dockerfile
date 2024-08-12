# Use an official Go runtime as a parent image
FROM golang:1.20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the local package files to the container's workspace




COPY go.mod go.sum ./

# Fetch dependencies (if using modules)
RUN go mod download

COPY . .

# Build the Go application
RUN CGO_ENABLED=0 GOOS=linux go build -o /main

# Expose port 8080 to the outside world
EXPOSE 9090

# Command to run the executable

CMD ["/main"]


