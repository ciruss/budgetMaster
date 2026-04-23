package ee.johan.budgetmaster.security;

import ee.johan.budgetmaster.dto.AuthToken;
import ee.johan.budgetmaster.entity.User;
import ee.johan.budgetmaster.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class JwtService {

    private final String superSecretKey = "Y29tcG9zaXRpb25lYXJseXNpY2tkYW5jZWZpZ2h0aW5nYmVjb21pbmdkb25lcmFwaWQ";
    private final SecretKey secretKey = Keys.hmacShaKeyFor(Decoders.BASE64URL.decode(superSecretKey));

    private final UserRepository userRepository;

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
