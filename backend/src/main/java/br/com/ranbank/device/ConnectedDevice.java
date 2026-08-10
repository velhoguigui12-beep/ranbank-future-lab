package br.com.ranbank.device;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "connected_devices")
public class ConnectedDevice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String type;
    private String location;
    private String lastAccess;
    private boolean trusted;
    private boolean blocked;

    protected ConnectedDevice() {}

    public ConnectedDevice(String name, String type, String location, String lastAccess, boolean trusted) {
        this.name = name;
        this.type = type;
        this.location = location;
        this.lastAccess = lastAccess;
        this.trusted = trusted;
        this.blocked = false;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getType() { return type; }
    public String getLocation() { return location; }
    public String getLastAccess() { return lastAccess; }
    public boolean isTrusted() { return trusted; }
    public boolean isBlocked() { return blocked; }
    public void toggleBlocked() { blocked = !blocked; }
}
