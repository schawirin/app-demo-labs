package com.company.mq;

import javax.ejb.MessageDriven;
import javax.ejb.ActivationConfigProperty;
import javax.jms.*;
import org.jboss.logging.Logger;

@MessageDriven(activationConfig = {
    @ActivationConfigProperty(propertyName = "destination", propertyValue = "DEV.QUEUE.1"),
    @ActivationConfigProperty(propertyName = "destinationType", propertyValue = "javax.jms.Queue"),
    @ActivationConfigProperty(propertyName = "connectionFactoryLookup", propertyValue = "java:/jms/RemoteConnectionFactory")
})
public class MQConsumerMDB implements MessageListener {

    private static final Logger LOG = Logger.getLogger(MQConsumerMDB.class);

    @Override
    public void onMessage(Message message) {
        try {
            if (message instanceof TextMessage) {
                TextMessage txtMsg = (TextMessage) message;
                LOG.infof("Mensagem recebida: %s", txtMsg.getText());
            }
        } catch (JMSException e) {
            LOG.error("Erro ao consumir mensagem", e);
        }
    }
}
