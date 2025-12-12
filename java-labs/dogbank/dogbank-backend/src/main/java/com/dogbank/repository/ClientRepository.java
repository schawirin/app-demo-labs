package com.dogbank.repository;

import com.dogbank.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    Optional<Client> findByAccountNumber(String accountNumber);
    Optional<Client> findByCpf(String cpf); // Método personalizado
}
