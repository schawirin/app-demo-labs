package com.company.mq;

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

    // Configurações da fila e do IBM MQ
    private static final String QUEUE_NAME = "DEV.QUEUE.1";
    private static final String QMGR = "QM1";
    private static final String HOST = "44.200.8.194"; // Exemplo: IBM MQ na EC2
    private static final int PORT = 1414;
    private static final String CHANNEL = "DEV.APP.SVRCONN";
    private static final String USER = "mqadmin";
    private static final String PASSWORD = "admin";

    /**
     * Método agendado para enviar uma mensagem a cada 30 segundos.
     */
    @Schedule(hour = "*", minute = "*", second = "*/30", persistent = false)
    public void sendMessage() {
        MQQueueConnectionFactory factory = new MQQueueConnectionFactory();
        Connection conn = null;
        Session session = null;

        try {
            // Configuração da fábrica de conexão para o IBM MQ
            factory.setHostName(HOST);
            factory.setPort(PORT);
            factory.setQueueManager(QMGR);
            factory.setChannel(CHANNEL);
            factory.setTransportType(WMQConstants.WMQ_CM_CLIENT);

            // Cria a conexão utilizando usuário e senha
            conn = factory.createConnection(USER, PASSWORD);
            // Inicia a conexão
            conn.start();

            // Cria uma sessão não transacionada com auto reconhecimento (auto-acknowledge)
            session = conn.createSession(false, Session.AUTO_ACKNOWLEDGE);
            // Cria a fila utilizando o nome configurado
            Queue queue = session.createQueue(QUEUE_NAME);

            // Cria o produtor e prepara a mensagem de texto
            MessageProducer producer = session.createProducer(queue);
            TextMessage message = session.createTextMessage("Teste de mensagem " + new Date());

            // Envia a mensagem para a fila
            producer.send(message);

            LOG.infof("Mensagem enviada para a fila %s: %s", QUEUE_NAME, message.getText());
        } catch (Exception e) {
            LOG.error("Erro ao enviar mensagem para o IBM MQ", e);
        } finally {
            // Fechamento dos recursos JMS com tratamento de exceções
            if (session != null) {
                try {
                    session.close();
                } catch (JMSException e) {
                    LOG.error("Erro ao fechar a sessão JMS", e);
                }
            }
            if (conn != null) {
                try {
                    conn.close();
                } catch (JMSException e) {
                    LOG.error("Erro ao fechar a conexão JMS", e);
                }
            }
        }
    }
}
