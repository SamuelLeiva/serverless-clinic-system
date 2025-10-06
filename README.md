# 🏥 Appointments Processing Service (appointments-app)

This repository contains the source code for an asynchronous appointment scheduling and processing service built using Serverless Framework and deployed on AWS Lambda (Node.js/TypeScript).

The application is structured following the principles of Clean Architecture to ensure separation of concerns, high maintainability, and testability.

## Key Features

- **REST API**: Provides endpoints for submitting new appointment requests (POST) and querying the status of existing appointments (GET).
- **Asynchronous Processing**: Uses SNS (Simple Notification Service) and SQS (Simple Queue Service) with Filter Policies to route appointment requests based on the country (PE or CL).
- **Decoupled Architecture**: The API gateway immediately returns a 202 Accepted response, delegating the heavy processing (simulated external DB connection) to dedicated Lambda processors (AppointmentProcessorPE/CL).
- **Event-Driven Completion**: Uses Amazon EventBridge to send a "Completion" event back to the main service, triggering a final SQS consumer to update the appointment status in DynamoDB.
- **Data Persistence**: Uses DynamoDB as the source of truth for all appointment records.

## 🏗️ Architecture Overview
The system utilizes a fan-out pattern for asynchronous processing, allowing for country-specific logic execution.

1. **Request (POST /appointment)**: AppointmentServiceLambda saves the initial record to DynamoDB and publishes a message to the AppointmentTopic (SNS) with a countryISO attribute (PE or CL).

2. **Filtering & Queuing**: The SNS topic has two subscriptions, each linked to a country-specific SQS Queue (SqsPe and SqsCl), using a Filter Policy on the countryISO attribute.

3. **Processing**: The dedicated processors (AppointmentProcessorPE/CL) are triggered by their respective SQS queues. They perform the core business logic (simulating external MySQL connection) and update the final status.

4. **Completion Loop**: Upon successful processing, the processor emits an AppointmentCompleted event to EventBridge.

5. **Status Update**: An EventBridge Rule routes the AppointmentCompleted event to the SqsReturn queue, which triggers the AppointmentServiceLambdaSqs handler to finalize the status in DynamoDB.

## Usage

### Deployment

In order to deploy the example, you need to run the following command:

```
serverless deploy
```

After running deploy, you should see output similar to:

```
Deploying "serverless-http-api" to stage "dev" (us-east-1)

✔ Service deployed to stack serverless-http-api-dev (91s)

endpoint: GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/
functions:
  hello: serverless-http-api-dev-hello (1.6 kB)
```

_Note_: In current form, after deployment, your API is public and can be invoked by anyone. For production deployments, you might want to configure an authorizer. For details on how to do that, refer to [HTTP API (API Gateway V2) event docs](https://www.serverless.com/framework/docs/providers/aws/events/http-api).

### Invocation

After successful deployment, you can call the created application via HTTP:

```
curl https://xxxxxxx.execute-api.us-east-1.amazonaws.com/
```

Which should result in response similar to:

```json
{ "message": "Go Serverless v4! Your function executed successfully!" }
```

## API Endpoints

All endpoints are managed by the AppointmentServiceLambda.

| Method   | Path                       | Description                                                             |
|----------|----------------------------|-------------------------------------------------------------------------|
| POST     | /appointment               | Submits a new appointment request. Returns 202 Accepted immediately.    |
| GET      | /appointment/{insuredId}   | Retrieves a list of appointments associated with the given insuredId.   |

### Example of POST Request's body

```json
{
    "insuredId": "12345",
    "scheduleId": 101,
    "countryISO": "PE"
}
```
