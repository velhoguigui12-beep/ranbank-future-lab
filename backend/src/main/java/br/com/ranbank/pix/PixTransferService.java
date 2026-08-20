package br.com.ranbank.pix;

import br.com.ranbank.account.BankAccount;
import br.com.ranbank.account.BankAccountRepository;
import br.com.ranbank.auth.AuthenticationService;
import br.com.ranbank.audit.AuditService;
import br.com.ranbank.notification.NotificationService;
import br.com.ranbank.automation.FlowExecutionService;
import br.com.ranbank.transaction.BankTransaction;
import br.com.ranbank.transaction.BankTransactionRepository;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class PixTransferService {
    private final PixKeyRepository pixKeys;
    private final PixTransferRepository transfers;
    private final BankAccountRepository accounts;
    private final BankTransactionRepository transactions;
    private final AuthenticationService authentication;
    private final NotificationService notifications;
    private final AuditService audit;
    private final FlowExecutionService flows;

    public PixTransferService(PixKeyRepository pixKeys, PixTransferRepository transfers,
                              BankAccountRepository accounts, BankTransactionRepository transactions,
                              AuthenticationService authentication, NotificationService notifications,
                              AuditService audit, FlowExecutionService flows) {
        this.pixKeys = pixKeys;
        this.transfers = transfers;
        this.accounts = accounts;
        this.transactions = transactions;
        this.authentication = authentication;
        this.notifications = notifications;
        this.audit = audit;
        this.flows = flows;
    }

    public Recipient resolveRecipient(Long senderAccountId, String rawKey) {
        PixKey key = pixKeys.findByNormalizedKey(normalize(rawKey))
            .orElseThrow(() -> new PixException("Não encontramos uma conta Ranbank para esta chave Pix."));
        if (key.getAccountId().equals(senderAccountId)) {
            throw new PixException("Use uma chave Pix de outra conta.");
        }
        BankAccount recipient = accounts.findById(key.getAccountId())
            .orElseThrow(() -> new PixException("A conta de destino não está disponível."));
        return new Recipient(recipient.getId(), recipient.getCustomerName(), recipient.getAccountNumber(),
            key.getKeyType(), mask(key.getDisplayKey()));
    }

    @Transactional
    public Receipt transfer(Long senderAccountId, String rawKey, BigDecimal amount,
                            String transactionPin, String requestedIdempotencyKey) {
        if (amount == null || amount.signum() <= 0) throw new PixException("Informe um valor positivo.");
        String idempotencyKey = normalizeIdempotencyKey(requestedIdempotencyKey);
        PixTransfer previous = transfers.findBySenderAccountIdAndIdempotencyKey(senderAccountId, idempotencyKey)
            .orElse(null);
        if (previous != null) return receipt(previous);

        authentication.verifyTransactionPin(senderAccountId, transactionPin);
        PixKey destinationKey = pixKeys.findByNormalizedKey(normalize(rawKey))
            .orElseThrow(() -> new PixException("Não encontramos uma conta Ranbank para esta chave Pix."));
        Long recipientAccountId = destinationKey.getAccountId();
        if (recipientAccountId.equals(senderAccountId)) throw new PixException("Não é possível enviar Pix para a própria conta.");

        Long firstId = Math.min(senderAccountId, recipientAccountId);
        Long secondId = Math.max(senderAccountId, recipientAccountId);
        BankAccount first = lock(firstId);
        BankAccount second = lock(secondId);
        BankAccount sender = first.getId().equals(senderAccountId) ? first : second;
        BankAccount recipient = first.getId().equals(recipientAccountId) ? first : second;

        try {
            sender.debit(amount);
            recipient.credit(amount);
        } catch (IllegalArgumentException exception) {
            throw new PixException(exception.getMessage());
        }

        String transferId = UUID.randomUUID().toString();
        PixTransfer transfer = transfers.save(new PixTransfer(transferId, senderAccountId,
            recipientAccountId, destinationKey.getNormalizedKey(), amount, idempotencyKey));
        BankTransaction debitTransaction = transactions.save(new BankTransaction(senderAccountId, "Pix enviado",
            recipient.getCustomerName() + " · agora", amount.negate(), "debit", transferId,
            recipientAccountId, idempotencyKey));
        transactions.save(new BankTransaction(recipientAccountId, "Pix recebido",
            sender.getCustomerName() + " · agora", amount, "credit", transferId,
            senderAccountId, null));
        accounts.save(sender);
        accounts.save(recipient);
        String senderPayload = "amount=" + amount + ";recipientAccountId=" + recipientAccountId;
        String recipientPayload = "amount=" + amount + ";senderAccountId=" + senderAccountId;
        audit.record(senderAccountId, "PIX_SENT", transferId, senderPayload);
        audit.record(recipientAccountId, "PIX_RECEIVED", transferId, recipientPayload);
        notifications.create(senderAccountId, "PIX_SENT", "Pix enviado",
            "Seu Pix de R$ " + amount + " para " + recipient.getCustomerName() + " foi concluído.", transferId);
        notifications.create(recipientAccountId, "PIX_RECEIVED", "Pix recebido",
            "Você recebeu R$ " + amount + " de " + sender.getCustomerName() + ".", transferId);
        flows.recordPixTransfer(senderAccountId, transferId);
        return receipt(transfer, recipient, debitTransaction.getId());
    }

    public Receipt receiptFor(Long accountId, String transferId) {
        PixTransfer transfer = transfers.findById(transferId)
            .filter(item -> item.getSenderAccountId().equals(accountId) || item.getRecipientAccountId().equals(accountId))
            .orElseThrow(() -> new PixException("Comprovante não encontrado."));
        return receipt(transfer);
    }

    private Receipt receipt(PixTransfer transfer) {
        BankAccount recipient = accounts.findById(transfer.getRecipientAccountId())
            .orElseThrow(() -> new PixException("Conta de destino não encontrada."));
        Long transactionId = transactions.findFirstByAccountIdAndTransferId(
            transfer.getSenderAccountId(), transfer.getId()).map(BankTransaction::getId).orElse(null);
        return receipt(transfer, recipient, transactionId);
    }

    private Receipt receipt(PixTransfer transfer, BankAccount recipient, Long transactionId) {
        return new Receipt(transfer.getId(), transactionId, transfer.getStatus(), transfer.getAmount(),
            transfer.getCreatedAt(), recipient.getCustomerName(), recipient.getAccountNumber(),
            mask(transfer.getPixKey()), transfer.getIdempotencyKey());
    }

    private BankAccount lock(Long id) {
        return accounts.findByIdForUpdate(id).orElseThrow(() -> new PixException("Conta não encontrada."));
    }

    public static String normalize(String key) {
        if (key == null || key.isBlank()) throw new PixException("Informe a chave Pix.");
        String trimmed = key.trim();
        if (trimmed.contains("@")) return trimmed.toLowerCase(Locale.ROOT);
        String digits = trimmed.replaceAll("\\D", "");
        return digits.isBlank() ? trimmed.toLowerCase(Locale.ROOT) : digits;
    }

    private String normalizeIdempotencyKey(String value) {
        String key = value == null || value.isBlank() ? UUID.randomUUID().toString() : value.trim();
        if (key.length() > 64) throw new PixException("A chave de idempotência deve ter no máximo 64 caracteres.");
        return key;
    }

    private String mask(String key) {
        if (key == null || key.length() < 5) return "••••";
        if (key.contains("@")) {
            int at = key.indexOf('@');
            return key.substring(0, Math.min(2, at)) + "•••" + key.substring(at);
        }
        return "••••" + key.substring(key.length() - 4);
    }

    public record Recipient(Long accountId, String name, String accountNumber, String keyType, String maskedKey) {}
    public record Receipt(String transferId, Long transactionId, String status, BigDecimal amount, Instant timestamp,
                          String recipientName, String recipientAccount, String maskedPixKey,
                          String idempotencyKey) {}

    public static class PixException extends RuntimeException {
        public PixException(String message) { super(message); }
    }
}
