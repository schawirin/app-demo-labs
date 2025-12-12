package com.dogbank.transaction.service;

import com.dogbank.transaction.dto.TransactionRequest;
import com.dogbank.transaction.dto.TransactionResponse;
import com.dogbank.transaction.entity.Transaction;
import com.dogbank.transaction.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    public TransactionResponse processTransaction(TransactionRequest request) {
        // Simule a transação: persista a transação e retorne uma resposta
        Transaction transaction = new Transaction();
        transaction.setAccountOriginId(request.getAccountOriginId());
        transaction.setAccountDestinationId(request.getAccountDestinationId());
        transaction.setAmount(request.getAmount());
        transaction = transactionRepository.save(transaction);

        TransactionResponse response = new TransactionResponse();
        response.setMessage("Transação realizada com sucesso");
        response.setTransactionTime(transaction.getTransactionTime());
        return response;
    }
}
