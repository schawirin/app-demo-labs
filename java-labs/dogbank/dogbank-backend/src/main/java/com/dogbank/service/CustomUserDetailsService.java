package com.dogbank.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    // Injete aqui o repositório de usuário, como UserRepository

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Busque o usuário no repositório
        // Exemplo fictício:
        // User user = userRepository.findByUsername(username);
        // if (user == null) {
        //     throw new UsernameNotFoundException("User not found");
        // }
        // return new org.springframework.security.core.userdetails.User(
        //         user.getUsername(), user.getPassword(), Collections.emptyList());
        
        throw new UsernameNotFoundException("User not found"); // Remova e substitua pelo código acima.
    }
}
