package ee.johan.budgetmaster.controller;

import ee.johan.budgetmaster.dto.SignupRequest;
import ee.johan.budgetmaster.dto.UserDto;
import ee.johan.budgetmaster.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@AllArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/users")
    public List<UserDto> getUsers() {
        return userService.getAllUsers();
    }

    @PostMapping("/signup")
    public void createUser(@RequestBody SignupRequest request) {
        userService.createUser(request);
    }
}
