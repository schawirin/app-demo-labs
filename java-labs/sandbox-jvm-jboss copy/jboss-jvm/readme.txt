# JMS Service Application

This project is a sample application demonstrating integration with Datadog using Java and JMS (Java Message Service) with an IBM MQ running in a Docker container. The application both generates and consumes messages from a JMS queue connected to IBM MQ and includes an automatic routine for the same without HTTP interaction.

## Features

- **JMS Message Production and Consumption**: The application enables generating and consuming messages in a JMS queue connected to IBM MQ.
- **Datadog Integration**: Custom tags for `service`, `env`, and `version` are automatically applied to messaging operations, facilitating tracing and monitoring in Datadog.
- **Automatic Messaging Routine**: In addition to manual HTTP interaction, the application has a scheduled routine for producing and consuming messages in the queue without user interaction.

## Key Technologies

- **Java**: Main programming language for the backend.
- **JMS (Java Message Service)**: Used for message exchange with IBM MQ.
- **IBM MQ**: Queueing system used for asynchronous communication.
- **Datadog Java APM**: Used for application monitoring, tracing, and logging.

## Main Libraries Used

- **Datadog Java APM** (`dd-trace-java`): Library for Datadog tracing integration.
- **javax.jms**: Standard interface for messaging interactions.
- **ActiveMQConnectionFactory**: Simulates a factory connection with IBM MQ.

## Setting up IBM MQ with Docker

To run IBM MQ in a Docker container, use the following command suitable for `amd64` architecture:

```bash
docker run -d --name ibm-mq \
  --platform linux/amd64 \
  --env LICENSE=accept \
  --env MQ_QMGR_NAME=QM1 \
  --publish 1414:1414 \
  --publish 9443:9443 \
  ibmcom/mq:latest
```

For systems with `x86` architecture, use this command instead:

```bash
docker run -d --name ibm-mq \
  --platform linux/x86_64 \
  --env LICENSE=accept \
  --env MQ_QMGR_NAME=QM1 \
  --publish 1414:1414 \
  --publish 9443:9443 \
  ibmcom/mq:latest
```

> **Note**: Ensure the architecture is specified correctly based on your operating system.

## Updating the IBM MQ IP for Testing

By default, the IBM MQ IP is set in the application code. To test in a different environment or change the IP, modify the `mqConnectionFactory` variable with the new IP or hostname:

```java
ConnectionFactory factory = new ActiveMQConnectionFactory("tcp://<NEW_IP>:1414");
```

Replace `<NEW_IP>` with the IP address where IBM MQ is running.

## Server Requirement: JBoss

The application is packaged as a `.war` file, requiring an application server such as **JBoss EAP 7.4** to run it. JBoss EAP enables `.war` file deployment and supports Java Enterprise applications.

- **Download JBoss EAP 7.4**: [Link to JBoss EAP 7.4](https://www.redhat.com/en/technologies/jboss-middleware/application-platform)

## How to Use the Application

1. **Start IBM MQ**: Make sure IBM MQ is running (locally or in a Docker container).
2. **Compile and Run the Application on JBoss**: Deploy the `.war` file on JBoss EAP to run the app.
3. **Use the HTTP Interface**:
   - Access the HTTP endpoint and click the button to manually generate and consume messages in the queue.
4. **Automatic JMS Routine**:
   - The application has a built-in routine that automatically sends and consumes messages from the queue without HTTP interaction.

## Code Structure

- **JmsService.java**: Main service class that configures JMS connection, sets Datadog tags, and sends messages to the queue.
- **Main Application**: Initializes the service and schedules the automatic execution for generating and consuming messages at defined intervals.

## Monitoring with Datadog

The application uses Datadog for tracing and log monitoring. Ensure `DD_API_KEY` and other variables are set in the `dd-java-agent.jar` so that custom tags are sent to Datadog. The `service`, `env`, and `version` tags are defined directly in the code for each message, making it easy to distinguish environments and versions in Datadog’s dashboard.

---

### Note

The automatic JMS routine runs in the background and does not require user interaction. This functionality is useful for testing the end-to-end JMS messaging flow in a development or testing environment.

