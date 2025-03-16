package com.dogbank.account.entity;

import javax.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "contas")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_conta", unique = true, nullable = false)
    private String accountNumber;

    @Column(name = "saldo", nullable = false)
    private BigDecimal balance;

    @Column(name = "usuario_id", nullable = false)
    private Long userId;

    // Construtor padrão
    public Account() {
    }

    // Construtor com parâmetros
    public Account(String accountNumber, BigDecimal balance, Long userId) {
        this.accountNumber = accountNumber;
        this.balance = balance;
        this.userId = userId;
    }

    // Getters e setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
