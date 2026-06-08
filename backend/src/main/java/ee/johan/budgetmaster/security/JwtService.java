package ee.johan.budgetmaster.security;

import ee.johan.budgetmaster.dto.AuthToken;
import ee.johan.budgetmaster.entity.User;
import ee.johan.budgetmaster.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.concurrent.TimeUnit;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final UserRepository userRepository;

    public JwtService(
            @Value("${app.jwt.superSecretKey:myTemporaryLocalDevelopmentSecretKey}") String superSecretKey,
            UserRepository userRepository
    ) {
        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64URL.decode(superSecretKey));
        this.userRepository = userRepository;
    }

    public AuthToken generateAuthToken(User user) {
        long tokenExpiration = System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(120);

        String token = Jwts.builder()
                .expiration(new Date(tokenExpiration))
                .subject(user.getId().toString())
                .signWith(secretKey)
                .compact();

        AuthToken authToken = new AuthToken();
        authToken.setToken(token);
        authToken.setExpiration(tokenExpiration);

        return authToken;
    }

    public User parseToken(String token) {
        Long userId = Long.parseLong(Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject());

        return userRepository.findById(userId).orElseThrow();
    }
}
