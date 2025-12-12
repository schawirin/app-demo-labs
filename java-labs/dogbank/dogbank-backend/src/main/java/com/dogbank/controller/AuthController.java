package com.dogbank.controller;

import com.dogbank.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class AuthController {

    @Autowired
    private AuthService authService; // Injeção do serviço de autenticação

    // Exibe a página de login
    @GetMapping("/login")
    public String login() {
        return "login"; // Corresponde a src/main/resources/templates/login.html
    }

    // Processa a submissão do formulário de login
    @PostMapping("/login")
    public String loginSubmit(@RequestParam("username") String username, 
                              @RequestParam("password") String password, 
                              Model model) {
        // Valida o login através do serviço de autenticação
        if (authService.validateUser(username, password)) {
            return "redirect:/home"; // Redireciona para a home se as credenciais estiverem corretas
        } else {
            model.addAttribute("error", "Usuário ou senha inválidos"); // Adiciona uma mensagem de erro
            return "login"; // Volta para a página de login em caso de falha
        }
    }

    // Exibe a página home
    @GetMapping("/home")
    public String home() {
        return "home"; // Corresponde a src/main/resources/templates/home.html
    }
}
