# Deploying Frontend to Google Cloud Run

This frontend is container-ready using Docker.

## Prerequisites

- Google Cloud Project with Cloud Run enabled.
- Google Cloud SDK (gcloud CLI) installed.

## 1. Build the Container

You need to provide the Backend API URL during the build process so the frontend knows where to send requests.

Replace `YOUR_BACKEND_URL` with your actual backend service URL (e.g., `https://backend-service-123.a.run.app`).

```bash
# Build the Docker image
docker build --build-arg VITE_API_BASE_URL=YOUR_BACKEND_URL -t a-series-frontend .
```

## 2. Test Locally (Optional)

```bash
docker run -p 8080:8080 a-series-frontend
```

Visit `http://localhost:8080` to test.

## 3. Deploy to Cloud Run

You can deploy directly from source (which builds securely in Cloud Build):

```bash
gcloud run deploy a-series-frontend \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --build-arg VITE_API_BASE_URL=YOUR_BACKEND_URL
```

*Note: Replace `YOUR_BACKEND_URL` with the actual URL of your backend service.*

## Environment Variables

The `VITE_API_BASE_URL` is baked into the application at **build time**. If you change your backend URL, you must rebuild and redeploy the frontend.
