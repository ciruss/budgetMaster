package ee.johan.budgetmaster.service;

import ee.johan.budgetmaster.dto.SignupRequest;
import ee.johan.budgetmaster.dto.UserDto;
import ee.johan.budgetmaster.entity.User;
import ee.johan.budgetmaster.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public void createUser(SignupRequest request) {
        User newUser = new User();
        newUser.setEmail(request.email());
        newUser.setPasswordHash(request.password());
        userRepository.save(newUser);
    }

    private UserDto mapToDto(User user) {
        return new UserDto(user.getId(), user.getEmail(), user.getDefaultSpendingLimit(), user.getCreatedAt());
    }
}
