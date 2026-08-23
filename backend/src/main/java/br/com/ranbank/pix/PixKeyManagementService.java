package br.com.ranbank.pix;

import br.com.ranbank.account.BankAccount;
import br.com.ranbank.account.BankAccountRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;

@Service
public class PixKeyManagementService {
    private static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    private final PixKeyRepository keys;
    private final BankAccountRepository accounts;

    public PixKeyManagementService(PixKeyRepository keys, BankAccountRepository accounts) {
        this.keys = keys;
        this.accounts = accounts;
    }

    public List<KeyView> list(Long accountId) {
        return keys.findByAccountId(accountId).stream().map(KeyView::from).toList();
    }

    @Transactional
    public KeyView create(Long accountId, String rawType, String rawValue) {
        BankAccount account = accounts.findById(accountId)
            .orElseThrow(() -> new PixKeyException("Conta não encontrada."));
        String type = rawType == null ? "" : rawType.trim().toUpperCase(Locale.ROOT);
        String display;
        String normalized;
        switch (type) {
            case "EMAIL" -> {
                display = rawValue == null ? "" : rawValue.trim().toLowerCase(Locale.ROOT);
                if (!EMAIL.matcher(display).matches()) throw new PixKeyException("Informe um e-mail válido.");
                normalized = display;
            }
            case "CPF" -> {
                normalized = digits(rawValue);
                if (normalized.length() != 11) throw new PixKeyException("O CPF deve ter onze dígitos.");
                if (!normalized.equals(account.getDocumentId())) {
                    throw new PixKeyException("A chave CPF deve pertencer ao titular da conta.");
                }
                display = normalized;
            }
            case "PHONE" -> {
                normalized = digits(rawValue);
                if (normalized.length() < 10 || normalized.length() > 11) {
                    throw new PixKeyException("Informe um telefone brasileiro com DDD.");
                }
                if (account.getPhoneNumber() != null && !normalized.equals(account.getPhoneNumber())) {
                    throw new PixKeyException("A chave telefone deve usar o número cadastrado no perfil.");
                }
                display = formatPhone(normalized);
            }
            case "RANDOM" -> {
                normalized = UUID.randomUUID().toString();
                display = normalized;
            }
            default -> throw new PixKeyException("Tipo de chave inválido. Use EMAIL, CPF, PHONE ou RANDOM.");
        }
        if (keys.existsByNormalizedKey(normalized)) throw new PixKeyException("Esta chave Pix já está cadastrada.");
        if ("PHONE".equals(type) && account.getPhoneNumber() == null) {
            account.updatePhoneNumber(normalized);
            accounts.save(account);
        }
        return KeyView.from(keys.save(new PixKey(accountId, type, normalized, display)));
    }

    @Transactional
    public void delete(Long accountId, Long keyId) {
        PixKey key = keys.findByIdAndAccountId(keyId, accountId)
            .orElseThrow(() -> new PixKeyException("Chave Pix não encontrada."));
        if (keys.countByAccountId(accountId) <= 1) {
            throw new PixKeyException("Mantenha pelo menos uma chave Pix ativa.");
        }
        keys.delete(key);
    }

    private static String digits(String value) { return value == null ? "" : value.replaceAll("\\D", ""); }
    private static String formatPhone(String value) {
        int prefix = value.length() == 11 ? 7 : 6;
        return "(%s) %s-%s".formatted(value.substring(0, 2), value.substring(2, prefix), value.substring(prefix));
    }

    public record KeyView(Long id, String type, String value, java.time.Instant createdAt) {
        static KeyView from(PixKey key) {
            return new KeyView(key.getId(), key.getKeyType(), key.getDisplayKey(), key.getCreatedAt());
        }
    }

    public static class PixKeyException extends RuntimeException {
        public PixKeyException(String message) { super(message); }
    }
}
