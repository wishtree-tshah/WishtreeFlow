document.addEventListener('alpine:init', () => {
    Alpine.data('app', () => ({
        currentView: 'dashboard', // dashboard, mailbox, shipping, sap

        // --- Mailbox / Ingestion Logic ---
        ingestionState: 'idle', // idle, polling, found, processing, complete
        ingestionMessage: '',
        ingestionProgress: 0,
        ingestionFiles: [],

        // --- Sales Components Logic ---
        hoursReclaimed: 12.4,
        showComparisonModal: false,

        // --- Dashboard / Extraction Logic ---
        mailboxCount: 142,
        poData: {
            number: '98221',
            vendor: 'Acme Logistics Co.',
            vendorConfidence: 99,
            poConfidence: 99,
            items: [
                { id: 1, sku: 'XJ-900', description: 'Standard Bracket', qty: 50, price: 12.00, originalPrice: 12.00, alert: false },
                { id: 2, sku: 'BZ-440 (Flag)', description: 'Heavy Duty Mount', qty: 10, price: 45.00, originalPrice: 41.50, alert: true, alertReason: 'Price variance detected' }
            ]
        },

        // --- Shipping Logic ---
        searchQuery: '',
        statusFilter: 'all', // all, in-transit, delayed, delivered
        escalateToast: { show: false, message: '' },
        showDelayedOnly: false,
        lastUpdatedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        shippingOrders: [
            {
                id: 'PO-98221',
                carrier: 'UPS Freight',
                status: 'In Transit',
                statusLabel: 'In Transit',
                statusClass: 'bg-blue-100 text-blue-700',
                location: 'Louisville, KY',
                eta: '2026-01-06',
                actionLabel: 'View Map',
                actionIcon: 'map',
                timelineExpanded: false,
                timeline: [
                    { status: 'Order Placed', date: 'Jan 1', completed: true },
                    { status: 'Picked Up', date: 'Jan 2', completed: true },
                    { status: 'In-Transit', date: 'Jan 4', completed: true },
                    { status: 'Delivered', date: 'Est Jan 6', completed: false }
                ]
            },
            {
                id: 'PO-98104',
                carrier: 'FedEx LTL',
                status: 'Delayed',
                statusLabel: 'Delayed (Weather)',
                statusClass: 'bg-amber-100 text-amber-700 animate-pulse',
                location: 'Memphis, TN',
                eta: '2026-01-08',
                actionLabel: 'Escalate',
                actionIcon: 'alert-triangle',
                timelineExpanded: false,
                timeline: [
                    { status: 'Order Placed', date: 'Dec 28', completed: true },
                    { status: 'Picked Up', date: 'Dec 29', completed: true },
                    { status: 'Weather Delay', date: 'Jan 2', completed: true, error: true },
                    { status: 'Delivered', date: 'Est Jan 8', completed: false }
                ]
            },
            {
                id: 'PO-98330',
                carrier: 'XPO Logistics',
                status: 'Picked Up',
                statusLabel: 'Picked Up',
                statusClass: 'bg-slate-200 text-slate-700',
                location: 'Chicago, IL',
                eta: '2026-01-10',
                actionLabel: 'Track Shipment',
                actionIcon: 'crosshair',
                timelineExpanded: false,
                timeline: [
                    { status: 'Order Placed', date: 'Jan 3', completed: true },
                    { status: 'Picked Up', date: 'Jan 4', completed: true },
                    { status: 'In-Transit', date: 'Pending', completed: false },
                    { status: 'Delivered', date: 'Est Jan 10', completed: false }
                ]
            },
            {
                id: 'PO-98001',
                carrier: 'DHL Express',
                status: 'Delivered',
                statusLabel: 'Delivered',
                statusClass: 'bg-green-100 text-green-700',
                location: 'Warehouse Dock B',
                eta: '2026-01-02',
                actionLabel: 'View POD',
                actionIcon: 'file-check',
                timelineExpanded: false,
                timeline: [
                    { status: 'Order Placed', date: 'Dec 20', completed: true },
                    { status: 'Picked Up', date: 'Dec 22', completed: true },
                    { status: 'In-Transit', date: 'Dec 28', completed: true },
                    { status: 'Delivered', date: 'Jan 2', completed: true }
                ]
            }
        ],

        // --- SAP Export Logic ---
        sapExporting: false,
        sapExportSuccess: false,
        sapData: [
            { id: 101, po: '98221', vendor: 'Acme Logistics', sku: 'XJ-900', qty: 50, price: 12.00, status: 'ok' },
            { id: 102, po: '98221', vendor: 'Acme Logistics', sku: 'BZ-440', qty: 10, price: 45.00, status: 'warning', msg: 'Price Discrepancy: Expected $41.50' },
            { id: 103, po: '98222', vendor: 'Global Supply', sku: 'GL-110', qty: 200, price: 5.50, status: 'ok' },
            { id: 104, po: '98223', vendor: 'Tech Parts Inc', sku: 'TP-99', qty: 5, price: 1200.00, status: 'ok' },
            { id: 105, po: '98224', vendor: 'Office Depot', sku: 'P-500', qty: 20, price: 4.00, status: 'ok' },
        ],

        // --- Methods ---
        get filteredOrders() {
            let result = this.shippingOrders;

            // Search
            if (this.searchQuery) {
                const q = this.searchQuery.toLowerCase();
                result = result.filter(o =>
                    o.id.toLowerCase().includes(q) ||
                    o.carrier.toLowerCase().includes(q)
                );
            }

            // Status Filter
            if (this.statusFilter !== 'all') {
                if (this.statusFilter === 'delayed') {
                    result = result.filter(o => o.status === 'Delayed');
                } else if (this.statusFilter === 'in-transit') {
                    result = result.filter(o => o.status === 'In Transit' || o.status === 'Picked Up');
                } else if (this.statusFilter === 'delivered') {
                    result = result.filter(o => o.status === 'Delivered');
                }
            } else if (this.showDelayedOnly) {
                result = result.filter(o => o.status === 'Delayed');
            }

            return result;
        },

        handleAction(order) {
            if (order.actionLabel === 'View Map' || order.actionLabel === 'Track Shipment') {
                this.toggleTimeline(order);
            } else if (order.actionLabel === 'Escalate') {
                this.escalateToast.message = `Drafting Email to ${order.carrier}...`;
                this.escalateToast.show = true;
                setTimeout(() => { this.escalateToast.show = false; }, 3000);
            } else if (order.actionLabel === 'View POD') {
                alert(`Opening Proof of Delivery for ${order.id}...`);
            }
        },

        isLate(order) {
            const today = new Date('2026-01-04'); // Using simulated date
            const eta = new Date(order.eta);
            return (eta < today && order.status !== 'Delivered');
        },

        init() {
            this.$nextTick(() => lucide.createIcons());

            this.$watch('currentView', () => {
                setTimeout(() => lucide.createIcons(), 50);
            });

            // Auto refresh time mock
            setInterval(() => {
                this.lastUpdatedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }, 60000);
        },

        startIngestion() {
            this.ingestionState = 'polling';
            this.ingestionMessage = 'Polling orders@acme-distro.com...';
            this.ingestionProgress = 10;
            this.ingestionFiles = [];

            // Step 1: Simulated Polling
            setTimeout(() => {
                this.ingestionProgress = 30;
                this.ingestionMessage = '3 new PDF attachments found.';
                this.ingestionState = 'found';

                // Populate dummy files
                this.ingestionFiles = [
                    { id: 1, name: 'PO_9982_Acme.pdf', from: 'alice@acme.com', size: '1.2 MB', status: 'pending', type: 'standard' },
                    { id: 2, name: 'Scan_Order_442.pdf', from: 'logistics@global.com', size: '4.5 MB', status: 'pending', type: 'image' },
                    { id: 3, name: 'Invoice_Req_002.pdf', from: 'procurement@techsupp.com', size: '0.8 MB', status: 'pending', type: 'standard' }
                ];

                // Step 2: Process File 1
                setTimeout(() => {
                    this.processFile(0);
                }, 800);

            }, 1500);
        },

        processFile(index) {
            if (index >= this.ingestionFiles.length) {
                this.ingestionState = 'complete';
                this.ingestionMessage = 'All files processed successfully.';
                this.ingestionProgress = 100;
                this.mailboxCount += 3;
                return;
            }

            const file = this.ingestionFiles[index];
            file.status = 'processing';
            this.ingestionMessage = `Extracting data from ${file.name}...`;

            // Advance progress bar based on files
            this.ingestionProgress = 30 + ((index + 1) / this.ingestionFiles.length * 70);

            setTimeout(() => {
                file.status = 'complete';
                this.$nextTick(() => lucide.createIcons());
                // Trigger next
                this.processFile(index + 1);
            }, 1500);
        },

        finalizeSapExport() {
            this.sapExporting = true;
            setTimeout(() => {
                this.sapExporting = false;
                this.sapExportSuccess = true;

                // Real-time value increment
                const target = 14.2;
                const start = this.hoursReclaimed;
                const duration = 1000;
                const startTime = performance.now();

                const animate = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    // Ease out quadratic
                    const ease = 1 - Math.pow(1 - progress, 2);

                    this.hoursReclaimed = (start + (target - start) * ease).toFixed(1);

                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    }
                };

                requestAnimationFrame(animate);

                // Reset success message after a delay
                setTimeout(() => {
                    this.sapExportSuccess = false;
                }, 5000);
            }, 2500);
        },

        toggleTimeline(order) {
            order.timelineExpanded = !order.timelineExpanded;
            this.$nextTick(() => {
                lucide.createIcons();
            });
        },

        pushToSap() {
            alert('Pushing PO #' + this.poData.number + ' to SAP system...');
        }
    }))
})
