# FeedSure 360 — Security, RBAC & Cryptographic Integrity

## 1. Security Architecture Overview

FeedSure 360 protects feed safety and supply chain traceability through three integrated layers:
1. **User Authentication & Role-Based Access Control (RBAC):** Cryptographically signed JSON Web Tokens (JWT) with PBKDF2 password hashing.
2. **Cryptographic Tamper-Evidence:** SHA-256 digital twin passport hashes for every analyzed batch.
3. **Data Protection at Rest & In Transit:** SQLite Write-Ahead Logging (WAL) and HTTPS/TLS-ready REST endpoints.

---

## 2. Role-Based Access Control (RBAC) Matrix

| Permission | Farmer (`farmer`) | Field Officer (`field_officer`) | Nutritionist (`nutritionist`) | Lab QA (`lab_technician`) | Admin (`admin`) |
|---|:---:|:---:|:---:|:---:|:---:|
| **Run Rapid 5-Point Test** | ✅ | ✅ | ❌ | ❌ | ✅ |
| **View Farm Advisory** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Edit Dairy Feed Basket** | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Review Out-of-Domain Scans** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Upload Wet-Lab Reference Data**| ❌ | ❌ | ❌ | ✅ | ✅ |
| **Recalibrate Models & PCA** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Verify Batch SHA-256 Passport** | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 3. Cryptographic Tamper-Evidence (SHA-256 Digital Twin)

Whenever a batch test is conducted, FeedSure 360 constructs a normalized canonical summary payload:
```python
canonical_payload = {
    "batch_id": "BATCH-2026-A109",
    "feed_type": "Maize Silage",
    "scenario": "healthy",
    "created_at": "2026-09-29T05:00:00Z",
    "evidence_score": 0.89,
    "trust_status": "TRUSTED (SIMULATION)",
    "dry_matter_pct": 34.5,
    "crude_protein_pct": 8.8,
    "storage_ph": 4.1
}
```

The SHA-256 hash is computed and stored alongside the batch record:
$$\text{Integrity Hash} = \text{SHA256}(\text{JSON}(\text{canonical\_payload}))$$

When the `POST /api/batches/{id}/verify-integrity` endpoint is called, or when the Quality Passport QR code is scanned in the field, the system recomputes the hash from the stored database state. Any unauthorized manual modification to nutrient values or trust statuses immediately triggers an integrity mismatch alert.
