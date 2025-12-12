package com.dogbank.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Contato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tipo;
    private String valor;

    // Relacionamento com o Cliente
    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;
}
