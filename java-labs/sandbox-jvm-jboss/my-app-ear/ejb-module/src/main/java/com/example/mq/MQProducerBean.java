package com.example.mq;

import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.ejb.Schedule;
import javax.jms.Connection;
import javax.jms.JMSException;
import javax.jms.MessageProducer;
import javax.jms.Queue;
import javax.jms.Session;
import javax.jms.TextMessage;
import com.ibm.mq.jms.MQQueueConnectionFactory;
import com.ibm.msg.client.wmq.WMQConstants;
import org.jboss.logging.Logger;
import java.util.Date;

@Singleton
@Startup
public class MQProducerBean {

    private static final Logger LOG = Logger.getLogger(MQProducerBean.class);

    private static final String QUEUE_NAME = "DEV.QUEUE.1";
    private static final String QMGR = "QM1";
    private static final String HOST = "seu_host_ibmmq"; // Altere para seu host real
    private static final int PORT = 1414;
    private static final String CHANNEL = "DEV.APP.SVRCONN";
    private static final String USER = "mqadmin";
    private static final String PASSWORD = "admin";

    @Schedule(hour = "*", minute = "*", second = "*/30", persistent = false)
    public void sendMessage() {
        LOG.info("Método agendado sendMessage() iniciado.");
        LOG.trace("Entrando no método sendMessage() para enviar mensagem ao IBM MQ.");

        MQQueueConnectionFactory factory = new MQQueueConnectionFactory();
        Connection conn = null;
        Session session = null;

        try {
            LOG.debug("Configurando a fábrica de conexão...");
            factory.setHostName(HOST);
            factory.setPort(PORT);
            factory.setQueueManager(QMGR);
            factory.setChannel(CHANNEL);
            factory.setTransportType(WMQConstants.WMQ_CM_CLIENT);

            LOG.debug("Criando a conexão com o IBM MQ...");
            conn = factory.createConnection(USER, PASSWORD);
            conn.start();

            LOG.debug("Criando a sessão JMS...");
            session = conn.createSession(false, Session.AUTO_ACKNOWLEDGE);
            Queue queue = session.createQueue(QUEUE_NAME);

            LOG.debug("Criando o produtor e a mensagem...");
            MessageProducer producer = session.createProducer(queue);
            TextMessage message = session.createTextMessage("Hello from JMS at " + new Date());

            LOG.debug("Enviando a mensagem...");
            producer.send(message);

            LOG.infof("Mensagem enviada para a fila %s: %s", QUEUE_NAME, message.getText());
        } catch (Exception e) {
            LOG.error("Erro ao enviar mensagem para o IBM MQ", e);
        } finally {
            try {
                if (session != null) {
                    session.close();
                    LOG.debug("Sessão fechada.");
                }
                if (conn != null) {
                    conn.close();
                    LOG.debug("Conexão fechada.");
                }
            } catch (JMSException ex) {
                LOG.error("Erro ao fechar a conexão JMS", ex);
            }
        }
    }
}
