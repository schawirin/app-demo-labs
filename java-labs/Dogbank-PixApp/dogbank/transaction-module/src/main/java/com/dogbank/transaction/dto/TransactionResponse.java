package com.dogbank.transaction.dto;

import java.time.LocalDateTime;

public class TransactionResponse {
    private String message;
    private LocalDateTime transactionTime;

    // Getters e setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getTransactionTime() {
        return transactionTime;
    }

    public void setTransactionTime(LocalDateTime transactionTime) {
        this.transactionTime = transactionTime;
    }
}
