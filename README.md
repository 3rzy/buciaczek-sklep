<!-- ================================================================= -->
<!-- KARTA TOŻSAMOŚCI REPOZYTORIUM                                      -->
<!-- Wygenerowano w ramach audytu HYDRA-CLEANUP-REPO-CONSISTENCY-20261124 -->
<!-- Data weryfikacji: 2026-11-24                           -->
<!-- ================================================================= -->

# KARTA TOŻSAMOŚCI: buciaczek-sklep

| Pole | Wartość |
| :--- | :--- |
| **Nazwa repozytorium** | `buciaczek-sklep` (`3rzy/buciaczek-sklep`) |
| **Status repozytorium** | `PARKED` |
| **Status komponentu / reuse** | `LIBRARY / REUSABLE_BLOCKS` |
| **Cel repozytorium** | Sklep internetowy e-commerce z obuwiem dziecięcym wdrożony w architekturze serverless na Netlify, wykorzystujący Airtable jako headless CMS z obsługą stanów magazynowych per rozmiar obuwia. |
| **Rola w ekosystemie** | HISTORICAL DEPLOYMENT / REFERENCE ARCHITECTURE (wzorzec lekkiego sklepu headless Netlify + Airtable) |
| **CURRENT (stan faktyczny)** | HEAD SHA 233f3eaf36df9b564c52e38f5ee4970380053a10 (2025-08-18), 14 elementów w repozytorium, stabilny stan po wdrożeniu poprawek prawnych i magazynowych. |
| **TARGET (plan docelowy)** | Repozytorium referencyjne dla wzorców integracji Airtable z Netlify Functions; docelowy handel e-commerce przenoszony do COMBINE (Odoo eCommerce). |
| **Zależności** | `Netlify Functions`, `Airtable REST API`, `Node.js`, `Vanilla HTML5/JS/CSS` |
| **Supersedes** | Wcześniejsza wersja sklepu buciaczek bez stanów magazynowych per rozmiar. |
| **Superseded by** | COMBINE (moduły sprzedaży e-commerce Odoo/Frappe). |
| **Źródło prawdy** | Repozytorium 3rzy/buciaczek-sklep (kod wdrożeniowy Netlify). |
| **Owner** | Krzyk (3rzy) |
| **Ostatnia weryfikacja** | 2026-11-24 |

### Kluczowe komponenty i potencjał ponownego użycia (Reuse)
- netlify/functions/get-products.js — bezserwerowa logika odpytywania Airtable i parsowania wariantów JSON
- index.html & szablony prawne — wzorcowe teksty regulaminu, polityki prywatności i banera cookies zgodne z RODO
- Tabela stanów per wariant — wzorzec mapowania magazynu w strukturze NoSQL/Airtable

### Rekomendacja dotycząca cyklu życia (Archiwizacja / Usunięcie)
- **Status rekomendacji:** `PARK_OR_ARCHIVE (rekomendacja: formalna archiwizacja w GitHub po dodaniu README; nie usuwać — wartość referencyjna)`
- **Uwagi i konflikty:** Brakujący pierwotnie plik README.md (zastępowany niniejszą Kartą Tożsamości).

---
<!-- PONIŻEJ ZACHOWANO ORYGINALNĄ ZAWARTOŚĆ REPOZYTORIUM (HISTORICAL / REFERENCE) -->

*(Pierwotnie repozytorium `buciaczek-sklep` nie posiadało pliku `README.md`. Powyższa Karta Tożsamości stanowi oficjalny opis i specyfikację repozytorium).*
