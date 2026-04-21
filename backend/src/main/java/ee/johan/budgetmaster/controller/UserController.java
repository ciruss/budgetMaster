package ee.johan.budgetmaster.controller;

import ee.johan.budgetmaster.dto.SignupRequest;
import ee.johan.budgetmaster.dto.UpdateUserRequest;
import ee.johan.budgetmaster.entity.User;
import ee.johan.budgetmaster.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@AllArgsConstructor
public class UserController {
    private final UserRepository userRepository;

    @GetMapping("/users")
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    @PostMapping("/signup")
    public void createUser(@RequestBody SignupRequest request) {
        User newUser = new User();
        newUser.setEmail(request.email());
        newUser.setPasswordHash(request.password());

        userRepository.save(newUser);
    }
}
