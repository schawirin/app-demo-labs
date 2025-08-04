package com.dogbank.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable() // desabilita CSRF para facilitar testes com API REST
            .authorizeRequests(authorize -> authorize
                .antMatchers("/api/auth/login").permitAll()  // endpoint de login liberado
                .anyRequest().authenticated()
            )
            .httpBasic(Customizer.withDefaults()); // utiliza autenticação básica para testes
        return http.build();
    }
}
