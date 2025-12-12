package com.dogbank.controller;

import com.dogbank.service.BankingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api")
public class TransferController {

    @Autowired
    private BankingService bankingService;

    @PostMapping("/transfer")
    public String transfer(@RequestParam String receiverCpf,
                           @RequestParam BigDecimal amount,
                           @AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {
        try {
            String senderCpf = user.getUsername();
            bankingService.transfer(senderCpf, receiverCpf, amount);
            return "Transferência realizada com sucesso!";
        } catch (Exception e) {
            return "Erro: " + e.getMessage();
        }
    }
}
