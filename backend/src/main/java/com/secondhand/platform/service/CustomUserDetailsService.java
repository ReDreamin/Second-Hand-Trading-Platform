package com.secondhand.platform.service;

import com.secondhand.platform.entity.UserAccount;
import com.secondhand.platform.repository.UserAccountRepository;
import com.secondhand.platform.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserAccountRepository userAccountRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserAccount user = userAccountRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        if (user.getStatus() != 1) {
            throw new UsernameNotFoundException("User is disabled or deleted: " + username);
        }

        return new UserPrincipal(user);
    }
}
