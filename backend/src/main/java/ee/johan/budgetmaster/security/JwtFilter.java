package ee.johan.budgetmaster.security;

import ee.johan.budgetmaster.entity.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        if (request.getHeader(HttpHeaders.AUTHORIZATION) != null && request.getHeader(HttpHeaders.AUTHORIZATION).startsWith("Bearer ")) {
            String token = request.getHeader(HttpHeaders.AUTHORIZATION).replace("Bearer ", "");

            User user = jwtService.parseToken(token);

            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    user.getId(),
                    user.getEmail(),
                    new ArrayList<>());

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}
