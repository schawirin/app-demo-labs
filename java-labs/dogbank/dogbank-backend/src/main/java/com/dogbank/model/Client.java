package com.dogbank.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.math.BigDecimal;
import java.util.Collection;

@Entity
@Table(name = "clients")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Client implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String cpf;

    private String bank;

    @Column(name = "account_number", unique = true)
    private String accountNumber;

    private String password;

    private BigDecimal balance; // Alterado para BigDecimal

    // Implementação dos métodos da interface UserDetails

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return null; // Retorne as autoridades/roles do usuário, se houver
    }

    @Override
    public String getUsername() {
        return this.accountNumber; // Usando accountNumber como username
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Ajuste conforme sua lógica
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Ajuste conforme sua lógica
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Ajuste conforme sua lógica
    }

    @Override
    public boolean isEnabled() {
        return true; // Ajuste conforme sua lógica
    }

    @Override
    public String getPassword() {
        return this.password; // Implementação do método getPassword()
    }
}
