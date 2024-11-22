package com.dogbank.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @Column(unique = true) // CPF deve ser único
    private String cpf;

    private String password; // Adicione o campo de senha, se não estiver definido

    // Relacionamento com Conta, se necessário
    // @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    // private List<Conta> contas;
}


