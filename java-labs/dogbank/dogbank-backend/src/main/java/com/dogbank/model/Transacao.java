package com.dogbank.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private BigDecimal valor;

    private LocalDateTime dataHora;

    private String tipo; // PIX ou TED

    // Relacionamento com a Conta de origem
    @ManyToOne
    @JoinColumn(name = "conta_origem_id")
    private Conta contaOrigem;

    // Relacionamento com a Conta de destino
    @ManyToOne
    @JoinColumn(name = "conta_destino_id")
    private Conta contaDestino;
}
