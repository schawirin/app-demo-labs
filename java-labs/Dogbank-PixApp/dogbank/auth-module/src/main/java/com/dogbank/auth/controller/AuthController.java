package com.dogbank.auth.controller;

import com.dogbank.auth.dto.AuthRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/login")
    public String login(@RequestBody AuthRequest request) {
        // Aqui você implementaria a lógica de autenticação,
        // por exemplo, validando o usuário e a senha e gerando um token JWT.
        // Neste exemplo, apenas simulamos o login.
        return "Login successful for user: " + request.getUsername();
    }
}
