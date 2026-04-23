package ee.johan.budgetmaster.controller;

import ee.johan.budgetmaster.dto.AuthToken;
import ee.johan.budgetmaster.dto.LoginRequest;
import ee.johan.budgetmaster.dto.SignupRequest;
import ee.johan.budgetmaster.dto.UserDto;
import ee.johan.budgetmaster.entity.User;
import ee.johan.budgetmaster.repository.UserRepository;
import ee.johan.budgetmaster.security.JwtService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@AllArgsConstructor
@RequestMapping("/api")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/auth/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already exists");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setCreatedAt(Instant.now());

        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/auth/login")
    public ResponseEntity<AuthToken> login(@RequestBody LoginRequest request) {
        if (request.email() == null) {
            throw new RuntimeException("Cannot login without email");
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Email invalid"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new RuntimeException("Password invalid");
        }

        return ResponseEntity.ok(jwtService.generateAuthToken(user));
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<?> logout() {
        // Stateless JWT; client side removes token
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = Long.valueOf(authentication.getPrincipal().toString());
        return userRepository.findById(userId)
                .map(user -> ResponseEntity.ok(
                        new UserDto(
                                user.getId(),
                                user.getEmail(),
                                user.getDefaultSpendingLimit(),
                                user.getCreatedAt()
                        )
                ))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }
}
