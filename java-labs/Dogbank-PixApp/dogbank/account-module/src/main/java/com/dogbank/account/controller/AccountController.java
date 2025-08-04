package com.dogbank.account.controller;

import com.dogbank.account.entity.Account;
import com.dogbank.account.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Optional;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @GetMapping("/{id}")
    public Optional<Account> getAccount(@PathVariable Long id) {
        return accountService.getAccountById(id);
    }

    @PostMapping
    public Account createAccount(@RequestBody Account account) {
        return accountService.createAccount(account);
    }

    @PutMapping("/{id}/balance")
    public Account updateBalance(@PathVariable Long id, @RequestParam BigDecimal balance) {
        return accountService.updateBalance(id, balance);
    }
}
