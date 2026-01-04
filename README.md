# Intelligent Order & Visibility Hub - PoC

This is a high-fidelity interactive prototype demonstrating the automated "PDF-to-Excel" workflow and real-time shipping visibility.

## Features
1. **Automated Ingestion**: Simulates fetching emails and extracting PDF attachments.
2. **Intelligent Extraction Workspace**: 
   - Split-screen view (PDF vs Data).
   - **Confidence Scores** for fields.
   - **Editable Grid** for line items.
   - **Price Discrepancy Alert** (Yellow highlight + Insight box).
3. **Verification**: 
   - "Validate & Push to SAP" simulation.
   - "Download .xlsx" simulation.
4. **Shipping Visibility**:
   - Real-time status tracking.
   - Interactive timeline (click row to expand).
   - "At Risk" highlighting for delayed orders.

## How to Run
Simply open `index.html` in any modern web browser. No server required.

## Tech Stack
- **HTML5**
- **Tailwind CSS** (via CDN)
- **Alpine.js** (via CDN) for interactivity
- **Lucide Icons** (via CDN)

## Directory Structure
- `index.html`: Main application.
- `js/app.js`: Application logic and state management.
- `assets/images/`: Contains dummy assets.
