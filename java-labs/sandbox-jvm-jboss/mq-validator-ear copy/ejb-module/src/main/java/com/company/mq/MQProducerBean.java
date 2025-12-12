package com.company.mq;

import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.ejb.Schedule;
import javax.jms.*;
import com.ibm.mq.jms.MQQueueConnectionFactory;
import org.jboss.logging.Logger; // 🔥 Agora usa JBoss Logging

@Singleton
@Startup
public class MQProducerBean {
    private static final Logger LOG = Logger.getLogger(MQProducerBean.class); // 🔥 Agora usa JBoss Logging

    @Schedule(hour = "*", minute = "*", second = "*/60", persistent = false)
    public void sendMessage() {
        MQQueueConnectionFactory factory = new MQQueueConnectionFactory();
        Connection conn = null;
        Session session = null;
        try {
            factory.setHostName("44.200.8.194");
            factory.setPort(1414);
            factory.setQueueManager("QM1");
            factory.setChannel("DEV.APP.SVRCONN");
            factory.setTransportType(1); // TCP/IP

            conn = factory.createConnection();
            session = conn.createSession(false, Session.AUTO_ACKNOWLEDGE);
            Queue queue = session.createQueue("DEV.QUEUE.1");

            MessageProducer producer = session.createProducer(queue);
            TextMessage msg = session.createTextMessage("Teste de mensagem");
            producer.send(msg);

            LOG.infof("Mensagem enviada para a fila: %s", msg.getText()); // 🔥 Corrigido para JBoss Logging

        } catch (Exception e) {
            LOG.error("Erro ao enviar mensagem", e);
        } finally {
            try {
                if (session != null) session.close();
                if (conn != null) conn.close();
            } catch (JMSException e) {
                LOG.error("Erro ao fechar conexão", e);
            }
        }
    }
}
