package com.dogbank.transaction.controller;

import com.dogbank.transaction.dto.TransactionRequest;
import com.dogbank.transaction.dto.TransactionResponse;
import com.dogbank.transaction.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping
    public TransactionResponse executeTransaction(@RequestBody TransactionRequest request) {
        return transactionService.processTransaction(request);
    }
}
