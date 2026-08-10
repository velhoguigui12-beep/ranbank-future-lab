package br.com.ranbank.device;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/devices")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ConnectedDeviceController {
    private final ConnectedDeviceRepository repository;

    public ConnectedDeviceController(ConnectedDeviceRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<DeviceResponse> list() {
        return repository.findAll().stream().map(DeviceResponse::from).toList();
    }

    @PatchMapping("/{id}/block")
    @ResponseStatus(HttpStatus.OK)
    public DeviceResponse toggleBlock(@PathVariable Long id) {
        ConnectedDevice device = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dispositivo não encontrado."));
        device.toggleBlocked();
        return DeviceResponse.from(repository.save(device));
    }

    public record DeviceResponse(Long id, String name, String type, String location,
        String lastAccess, boolean trusted, boolean blocked) {
        static DeviceResponse from(ConnectedDevice device) {
            return new DeviceResponse(device.getId(), device.getName(), device.getType(),
                device.getLocation(), device.getLastAccess(), device.isTrusted(), device.isBlocked());
        }
    }
}
