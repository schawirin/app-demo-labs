package com.dogbank.service;

import org.springframework.stereotype.Service;

@Service
public class AuthService {

    // Método simples de validação para demonstração; substitua com a lógica real
    public boolean validateUser(String username, String password) {
        // Aqui você pode implementar a lógica de validação, como verificar no banco de dados
        // Exemplo simples:
        return "admin".equals(username) && "password".equals(password);
    }
}
