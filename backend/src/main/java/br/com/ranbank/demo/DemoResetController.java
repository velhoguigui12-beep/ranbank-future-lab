package br.com.ranbank.demo;

import br.com.ranbank.account.BankAccount;
import br.com.ranbank.account.BankAccountRepository;
import br.com.ranbank.auth.AuthenticationService;
import br.com.ranbank.banking.ScheduledOperationRepository;
import br.com.ranbank.device.ConnectedDevice;
import br.com.ranbank.device.ConnectedDeviceRepository;
import br.com.ranbank.transaction.BankTransaction;
import br.com.ranbank.transaction.BankTransactionRepository;
import br.com.ranbank.pix.PixKey;
import br.com.ranbank.pix.PixKeyRepository;
import br.com.ranbank.pix.PixTransfer;
import br.com.ranbank.pix.PixTransferRepository;
import br.com.ranbank.notification.NotificationRepository;
import br.com.ranbank.automation.FlowExecutionRepository;
import br.com.ranbank.audit.AuditEventRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/demo")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class DemoResetController {
    private final BankTransactionRepository transactionRepository;
    private final BankAccountRepository accountRepository;
    private final ConnectedDeviceRepository deviceRepository;
    private final AuthenticationService authenticationService;
    private final ScheduledOperationRepository scheduledOperationRepository;
    private final PixKeyRepository pixKeyRepository;
    private final NotificationRepository notificationRepository;
    private final FlowExecutionRepository flowExecutionRepository;
    private final AuditEventRepository auditEventRepository;
    private final PixTransferRepository pixTransferRepository;

    public DemoResetController(BankTransactionRepository transactionRepository, BankAccountRepository accountRepository,
                               ConnectedDeviceRepository deviceRepository, AuthenticationService authenticationService,
                               ScheduledOperationRepository scheduledOperationRepository, PixKeyRepository pixKeyRepository,
                               NotificationRepository notificationRepository, FlowExecutionRepository flowExecutionRepository,
                               AuditEventRepository auditEventRepository, PixTransferRepository pixTransferRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.deviceRepository = deviceRepository;
        this.authenticationService = authenticationService;
        this.scheduledOperationRepository = scheduledOperationRepository;
        this.pixKeyRepository = pixKeyRepository;
        this.notificationRepository = notificationRepository;
        this.flowExecutionRepository = flowExecutionRepository;
        this.auditEventRepository = auditEventRepository;
        this.pixTransferRepository = pixTransferRepository;
    }

    @PostMapping("/reset")
    @Transactional
    public Map<String, String> reset(HttpServletRequest request) {
        Long accountId = (Long) request.getAttribute(AuthenticationService.ACCOUNT_REQUEST_ATTRIBUTE);
        if (!Long.valueOf(1L).equals(accountId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "A restauração existe apenas para a conta de apresentação.");
        }
        List<PixTransfer> demoTransfers = pixTransferRepository
            .findBySenderAccountIdOrRecipientAccountId(accountId, accountId);
        for (PixTransfer transfer : demoTransfers) {
            Long counterpartId = transfer.getSenderAccountId().equals(accountId)
                ? transfer.getRecipientAccountId() : transfer.getSenderAccountId();
            BankAccount counterpart = accountRepository.findByIdForUpdate(counterpartId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT,
                    "Não foi possível restaurar a contraparte do Pix."));
            if (transfer.getSenderAccountId().equals(accountId)) {
                counterpart.reverseTransferCredit(transfer.getAmount());
            } else {
                counterpart.credit(transfer.getAmount());
            }
            accountRepository.save(counterpart);
            transactionRepository.deleteByTransferId(transfer.getId());
            notificationRepository.deleteByReferenceId(transfer.getId());
            flowExecutionRepository.deleteByReferenceId(transfer.getId());
            auditEventRepository.deleteByReferenceId(transfer.getId());
        }
        pixTransferRepository.deleteAll(demoTransfers);
        scheduledOperationRepository.deleteByAccountId(accountId);
        transactionRepository.deleteByAccountId(accountId);
        deviceRepository.deleteByAccountId(accountId);
        notificationRepository.deleteByAccountId(accountId);
        flowExecutionRepository.deleteByAccountId(accountId);
        auditEventRepository.deleteByAccountId(accountId);
        BankAccount admin = accountRepository.findById(accountId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conta de apresentação não encontrada."));
        admin.restoreDemoState();
        accountRepository.save(admin);
        if (!pixKeyRepository.existsByNormalizedKey("ana@ranbank.demo")) {
            pixKeyRepository.save(new PixKey(1L, "EMAIL", "ana@ranbank.demo", "ana@ranbank.demo"));
        }
        if (!pixKeyRepository.existsByNormalizedKey("12345678909")) {
            pixKeyRepository.save(new PixKey(1L, "CPF", "12345678909", "123.456.789-09"));
        }
        if (!pixKeyRepository.existsByNormalizedKey("61999990101")) {
            pixKeyRepository.save(new PixKey(1L, "PHONE", "61999990101", "(61) 99999-0101"));
        }
        transactionRepository.saveAll(List.of(
            new BankTransaction(1L, "Pix recebido", "Maria Silva · hoje, 09:41", new BigDecimal("250.00"), "credit"),
            new BankTransaction(1L, "Transferência enviada", "João Pereira · hoje, 08:15", new BigDecimal("-120.00"), "debit"),
            new BankTransaction(1L, "Pagamento", "Supermercado Bom Preço · ontem, 19:32", new BigDecimal("-89.90"), "debit"),
            new BankTransaction(1L, "Compra no cartão", "Livraria Cultura · ontem, 16:20", new BigDecimal("-45.60"), "debit")
        ));
        deviceRepository.saveAll(List.of(
            new ConnectedDevice(1L, "iPhone de Ana", "Celular", "Brasília, DF", "Agora", true),
            new ConnectedDevice(1L, "Notebook pessoal", "Computador", "Brasília, DF", "Hoje, 20:14", true),
            new ConnectedDevice(1L, "Galaxy S24", "Celular", "Taguatinga, DF", "Hoje, 03:18", false),
            new ConnectedDevice(1L, "Caixa eletrônico 0842", "Terminal IoT", "Asa Sul, Brasília, DF", "Ontem, 17:42", true)
        ));
        authenticationService.configureDemoCredentials();
        return Map.of("message", "Demonstração restaurada com sucesso.");
    }
}
