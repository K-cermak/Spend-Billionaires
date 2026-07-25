const Utils = {
    formatMoney: (value) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
};

const ReceiptUI = {
    elements: {},

    cacheDOM() {
        this.elements = {
            customerName: document.querySelector(".selectedPersonName"),
            receiptDate: document.querySelector(".receiptDate"),
            container: document.querySelector(".receiptItems"),
            totalPrice: document.querySelector(".totalPrice")
        };
    },

    getStoredData() {
        const rawItems = sessionStorage.getItem("boughtItems");
        const customerName = sessionStorage.getItem("selectedName");
        
        return {
            boughtThings: JSON.parse(rawItems) || [],
            customerName: customerName || "Unknown"
        };
    },

    groupItems(items) {
        const grouped = items.reduce((acc, [name, price]) => {
            if (!acc[name]) {
                acc[name] = { name, price: Number(price), quantity: 0 };
            }
            acc[name].quantity++;
            return acc;
        }, {});
        
        return Object.values(grouped);
    },

    render() {
        const { boughtThings, customerName } = this.getStoredData();
        
        if (this.elements.customerName) {
            this.elements.customerName.textContent = customerName;
        }
        
        if (this.elements.receiptDate) {
            this.elements.receiptDate.textContent = new Date().toLocaleDateString("en-GB");
        }

        const lines = this.groupItems(boughtThings);
        let totalPrice = 0;

        // Empty state
        if (lines.length === 0) {
            this.elements.container.innerHTML = '<p class="sb-line__name mb-0">Nothing bought yet. Go back and pick something.</p>';
            if (this.elements.totalPrice) {
                this.elements.totalPrice.textContent = Utils.formatMoney(0);
            }
            return;
        }

        const fragment = document.createDocumentFragment();

        lines.forEach(line => {
            const lineTotal = line.price * line.quantity;
            totalPrice += lineTotal;

            const lineDiv = document.createElement("div");
            lineDiv.className = "sb-line";
            lineDiv.innerHTML = `
                <span class="sb-line__name">${line.name}</span>
                <span class="sb-line__qty">${line.quantity} &times; ${Utils.formatMoney(line.price)}</span>
                <span class="sb-line__price">$ ${Utils.formatMoney(lineTotal)}</span>
            `;
            fragment.appendChild(lineDiv);
        });

        this.elements.container.innerHTML = ""; // Clear loading/fallback state
        this.elements.container.appendChild(fragment);
        
        if (this.elements.totalPrice) {
            this.elements.totalPrice.textContent = Utils.formatMoney(totalPrice);
        }
    }
};

window.addEventListener("load", () => {
    ReceiptUI.cacheDOM();
    ReceiptUI.render();
});

