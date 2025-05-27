# BsuirFrontend

## Set up tips:

### 1. Configure shared-network in docker:

```bash
docker network create shared-network
```

### 2. Add network configuration to docker-compose.yaml where answer-pipeline is.

(something like this)
```bash
services:
  answer-pipeline:
    image: ghcr.io/semantic-hallucinations/answer_pipeline:...
    ports:
      - "8080:8000"
    networks:
      - shared-network

networks:
  shared-network:
    external: true
```

### 3. Launch answer-pipline container first, then frontend.