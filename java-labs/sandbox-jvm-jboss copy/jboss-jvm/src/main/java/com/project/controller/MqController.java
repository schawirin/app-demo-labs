package com.project.controller;

import javax.jms.Connection;
import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.MessageConsumer;
import javax.jms.MessageProducer;
import javax.jms.Queue;
import javax.jms.Session;
import javax.jms.TextMessage;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ibm.mq.jms.MQConnectionFactory;
import com.ibm.msg.client.wmq.WMQConstants;

@RestController
public class MqController {

    private static final String QUEUE_NAME = "DEV.QUEUE.1";
    private static final String QMGR = "QM1";
    private static final String HOST = "54.87.125.62";
    private static final int PORT = 1414;
    private static final String CHANNEL = "DEV.APP.SVRCONN";

    @GetMapping("/produce")
    public String produceMessage() {
        try {
            MQConnectionFactory factory = new MQConnectionFactory();
            factory.setHostName(HOST);
            factory.setPort(PORT);
            factory.setQueueManager(QMGR);
            factory.setChannel(CHANNEL);
            factory.setTransportType(WMQConstants.WMQ_CM_CLIENT);

            Connection connection = factory.createConnection();
            Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
            Queue queue = session.createQueue(QUEUE_NAME);
            MessageProducer producer = session.createProducer(queue);
            TextMessage message = session.createTextMessage("Test message for IBM MQ");
            producer.send(message);

            producer.close();
            session.close();
            connection.close();

            System.out.println("Message produced: " + message.getText());
            return "Message produced: " + message.getText();
        } catch (JMSException e) {
            System.out.println("Failed to produce message: " + e.getMessage());
            return "Failed to produce message: " + e.getMessage();
        }
    }

    @GetMapping("/consume")
    public String consumeMessage() {
        try {
            MQConnectionFactory factory = new MQConnectionFactory();
            factory.setHostName(HOST);
            factory.setPort(PORT);
            factory.setQueueManager(QMGR);
            factory.setChannel(CHANNEL);
            factory.setTransportType(WMQConstants.WMQ_CM_CLIENT);

            Connection connection = factory.createConnection();
            Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
            Queue queue = session.createQueue(QUEUE_NAME);
            MessageConsumer consumer = session.createConsumer(queue);
            connection.start();
            Message message = consumer.receive(1000);

            String result;
            if (message instanceof TextMessage) {
                TextMessage textMessage = (TextMessage) message;
                result = "Message consumed: " + textMessage.getText();
            } else {
                result = "No message available";
            }

            consumer.close();
            session.close();
            connection.close();

            System.out.println(result);
            return result;
        } catch (JMSException e) {
            System.out.println("Failed to consume message: " + e.getMessage());
            return "Failed to consume message: " + e.getMessage();
        }
    }

    // Agendamento automático para produzir e consumir mensagens a cada 5 segundos
    @Scheduled(fixedRate = 5000)
    public void automaticProduceConsume() {
        System.out.println(produceMessage());
        System.out.println(consumeMessage());
    }
}
