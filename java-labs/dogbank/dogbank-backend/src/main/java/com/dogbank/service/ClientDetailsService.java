package com.dogbank.service;

import com.dogbank.model.Client;
import com.dogbank.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class ClientDetailsService implements UserDetailsService {

    private final ClientRepository clientRepository;

    @Autowired
    public ClientDetailsService(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String accountNumber) throws UsernameNotFoundException {
        return clientRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with account number: " + accountNumber));
    }
}
