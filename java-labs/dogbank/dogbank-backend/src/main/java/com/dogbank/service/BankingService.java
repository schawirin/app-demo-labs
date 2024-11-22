package com.dogbank.service;

import com.dogbank.model.Client;
import com.dogbank.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class BankingService {

    private final ClientRepository clientRepository;

    @Autowired
    public BankingService(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    public void transfer(String cpfFrom, String cpfTo, BigDecimal amount) {
        Client sender = clientRepository.findByCpf(cpfFrom)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        Client receiver = clientRepository.findByCpf(cpfTo)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        if (sender.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        // Subtrai do saldo do remetente
        sender.setBalance(sender.getBalance().subtract(amount));
        clientRepository.save(sender);

        // Adiciona ao saldo do receptor
        receiver.setBalance(receiver.getBalance().add(amount));
        clientRepository.save(receiver);
    }
}
