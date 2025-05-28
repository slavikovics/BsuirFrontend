# BsuirFrontend

## Set up tips:

### 0. Bsuir-assistant must be installed first: [github](https://github.com/semantic-hallucinations/bsuir-assistant)

### 1. Configure a network in docker. Here is an example for ``"shared-network"``:

```bash
docker network create shared-network
```

### 2. Add network configuration to docker-compose.yaml where answer-pipeline is.

(something like this)
```bash
services:
  qdrant:
    image: qdrant/qdrant:latest
    container_name: qdrant
    ports:
      - "6333:6333"  # HTTP API
      - "6334:6334"  # gRPC API
    volumes:
      - ./qdrant_data:/qdrant/storage
    environment:
      - QDRANT_ALLOW_CORS=true
    networks:
      - shared-network
    restart: unless-stopped
    
  answer-pipeline:
    image: ghcr.io/semantic-hallucinations/answer_pipeline:8f7cd9e325242e500c05f38247f367e0a591a215
    ports:
      - "8080:8000"
    env_file:
      - .env
    networks:
      - shared-network
  tele-bot:
    image: ghcr.io/semantic-hallucinations/bsuir-helper-bot:d3eebd5b45edf42f6f13497e32742ce2fef050a1
    volumes:
      - ./logs:/app/logs
    env_file:
      - .env
    networks:
      - shared-network
      
networks:
  shared-network:
    external: true
```

### 3. Adjust ``/nginx/default.conf`` if your answer-pipeline has different name or port. This will help nginx to set up a proxy to bypass CORS.
```
server {
    listen 80;

    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ =404;
    }

    location /api/ {
        proxy_pass http://answer-pipeline:8000/; <---- CHECK THIS LINE
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. Launch answer-pipline container first, then frontend.
```
docker compose up
```

### 5. Now you can open frontend by going to ``http://localhost:3030/``