package com.dogbank.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.dogbank.model.Transacao;

public interface TransacaoRepository extends JpaRepository<Transacao, Long> {
    // Métodos adicionais, se necessário
}

