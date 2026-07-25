const AppState = {
    modal: { reset: 0, receipt: 0 },
    soundActive: true,
    startingMoney: 0,
    currentMoney: 0,
    boughtThings: []
};

const Sounds = {
    cash1: new Audio("partials/sounds/cash1.mp3"),
    cash2: new Audio("partials/sounds/cash2.mp3"),
    cash3: new Audio("partials/sounds/cash3.mp3"),
    cash4: new Audio("partials/sounds/cash4.mp3"),
    cash5: new Audio("partials/sounds/cash5.mp3")
};

const Utils = {
    formatMoney: (value) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "),
    
    shortMoneyParts: (value) => {
        if (value >= 1e12) return { amount: (value / 1e12).toFixed(2).replace(/\.?0+$/, ""), unit: "T" };
        if (value >= 1e9) return { amount: (value / 1e9).toFixed(1).replace(/\.0$/, ""), unit: "B" };
        if (value >= 1e6) return { amount: (value / 1e6).toFixed(1).replace(/\.0$/, ""), unit: "M" };
        if (value >= 1e3) return { amount: (value / 1e3).toFixed(1).replace(/\.0$/, ""), unit: "K" };
        return { amount: Utils.formatMoney(value), unit: "" };
    },

    formatShortMoney: (value) => {
        const { amount, unit } = Utils.shortMoneyParts(value);
        return unit ? `${amount} ${unit}` : amount;
    },

    showEmptyState: (container, message) => {
        container.innerHTML = `<p class="sb-empty">${message}</p>`;
    }
};

const Modals = {
    reset: {
        global: { closable: true, size: "md", scrollable: false, position: "center" },
        header: { title: "Start over", closeButton: true },
        main: { content: "This clears the receipt and takes you back to the list of fortunes." },
        footer: {
            buttons: {
                close: { text: "Keep spending", type: "secondary", function: "close" },
                function: {
                    text: "<i class='bi bi-arrow-counterclockwise ms-0 me-1'></i> Start over",
                    type: "danger",
                    function: "function",
                    dataset: () => {
                        UI.backToPeople();
                        closeModal(AppState.modal.reset);
                    }
                }
            }
        }
    },
    receipt: {
        global: { closable: true, size: "lg", scrollable: true, position: "center" },
        header: { title: "Receipt", closeButton: true },
        main: { content: "<iframe src='receipt.html' title='Receipt' style='width: 100%; height: 100%; border: none;'></iframe>" },
        footer: {
            buttons: {
                close: { text: "Close", type: "secondary", function: "close" },
                function: {
                    text: "<i class='bi bi-printer ms-0 me-1'></i> Print receipt",
                    type: "primary",
                    function: "function",
                    dataset: () => {
                        const frame = document.querySelector(`#${AppState.modal.receipt} iframe`);
                        if (frame) {
                            frame.contentWindow.focus();
                            frame.contentWindow.print();
                        }
                    }
                }
            }
        }
    }
};

const UI = {
    elements: {}, // Cached on load

    cacheDOM() {
        this.elements = {
            bar: document.querySelector(".selectedPerson"),
            amount: document.querySelector(".sb-pos__amount"),
            meter: document.querySelector(".sb-pos__meter"),
            fill: document.querySelector(".sb-pos__meter-fill"),
            spent: document.querySelector(".sb-pos__spent"),
            personMoney: document.querySelector(".selectedPersonMoney"),
            personPhoto: document.querySelector(".selectedPersonPhoto"),
            personName: document.querySelector(".selectedPersonName"),
            itemsWrap: document.querySelector(".itemsForSale-wrap"),
            peopleGrid: document.querySelector(".people"),
            peopleCount: document.querySelector(".peopleCount"),
            itemsGrid: document.querySelector(".itemsForSale")
        };
    },

    updateReadout() {
        const { bar, amount, meter, fill, spent, personMoney } = this.elements;
        
        personMoney.innerHTML = Utils.formatMoney(AppState.currentMoney);

        const spentMoney = AppState.startingMoney - AppState.currentMoney;
        const percent = AppState.startingMoney > 0 ? Math.min((spentMoney / AppState.startingMoney) * 100, 100) : 0;
        
        fill.style.width = `${percent}%`;
        meter.setAttribute("aria-valuenow", Math.round(percent));

        if (AppState.currentMoney < 0) {
            bar.classList.add("is-broke");
            spent.innerHTML = `Over budget by $ ${Utils.formatMoney(Math.abs(AppState.currentMoney))}`;
        } else {
            bar.classList.remove("is-broke");
            spent.innerHTML = spentMoney === 0 
                ? "Nothing spent yet" 
                : `${percent.toFixed(1)}% of the fortune gone &middot; ${AppState.boughtThings.length} items`;
        }

        // Short pop so the number reads as a register tick
        amount.classList.remove("is-ticking");
        void amount.offsetWidth; // Trigger reflow
        amount.classList.add("is-ticking");
    },

    syncPosHeight() {
        if (this.elements.bar.classList.contains("d-none")) return;
        document.documentElement.style.setProperty("--sb-pos-height", `${this.elements.bar.offsetHeight}px`);
    },

    selectPerson(person) {
        AppState.boughtThings = [];
        AppState.startingMoney = person.money;
        AppState.currentMoney = person.money;

        this.elements.personPhoto.src = person.image;
        this.elements.personPhoto.setAttribute("alt", person.name);
        this.elements.personName.innerHTML = person.name;

        // Clear item counters left over from a previous run
        document.querySelectorAll(".sb-count").forEach(badge => {
            badge.innerHTML = "0";
            badge.classList.add("is-hidden");
        });

        this.elements.bar.classList.remove("d-none");
        this.elements.itemsWrap.classList.remove("d-none");
        document.body.classList.add("is-shopping");

        this.updateReadout();
        this.syncPosHeight();
        window.scrollTo({ top: 0 });
    },

    backToPeople() {
        AppState.boughtThings = [];
        AppState.startingMoney = 0;
        AppState.currentMoney = 0;

        this.elements.bar.classList.add("d-none");
        this.elements.itemsWrap.classList.add("d-none");
        document.body.classList.remove("is-shopping");
        window.scrollTo({ top: 0 });
    },

    async loadPeople() {
        try {
            const response = await fetch("partials/json/people.json");
            const rawData = await response.json();
            const data = Object.values(rawData);

            if (data.length === 0) {
                Utils.showEmptyState(this.elements.peopleGrid, "No fortunes available right now.");
                this.elements.peopleCount.innerHTML = "";
                return;
            }

            this.elements.peopleCount.innerHTML = `${data.length} fortunes available`;

            data.forEach(person => {
                const column = document.createElement("div");
                column.className = "col-12 col-sm-6 col-lg-4 col-xl-3 d-flex";
                const worth = Utils.shortMoneyParts(person.money);

                const personDiv = document.createElement("div");
                personDiv.className = "person card text-center";
                personDiv.innerHTML = `
                    <img src="${person.image}" class="card-img-top" alt="${person.name}" loading="lazy">
                    <div class="card-body">
                        <h3 class="card-title">${person.name}</h3>
                        <p class="sb-worth">
                            <span class="sb-worth__label">Net worth</span>
                            <span class="sb-worth__value">$${worth.amount}<span class="sb-worth__unit">${worth.unit}</span></span>
                        </p>
                        <button type="button" class="btn btn-primary stretched-link">Spend it</button>
                    </div>
                `;

                personDiv.querySelector("button").addEventListener("click", () => this.selectPerson(person));
                column.appendChild(personDiv);
                this.elements.peopleGrid.appendChild(column);
            });
        } catch (error) {
            Utils.showEmptyState(this.elements.peopleGrid, "The fortunes could not be loaded. Reload the page to try again.");
            this.elements.peopleCount.innerHTML = "";
        }
    },

    async loadItems() {
        try {
            const response = await fetch("partials/json/items.json");
            const rawData = await response.json();
            const data = Object.values(rawData);

            if (data.length === 0) {
                Utils.showEmptyState(this.elements.itemsGrid, "The shop is empty right now.");
                return;
            }

            data.forEach(item => {
                const column = document.createElement("div");
                column.className = "col-12 col-sm-6 col-lg-4 col-xl-3 d-flex";

                const itemDiv = document.createElement("div");
                itemDiv.className = "item card text-center";
                itemDiv.innerHTML = `
                    <span class="sb-count is-hidden" aria-hidden="true">0</span>
                    <img src="${item.image}" class="card-img-top" alt="${item.name}" loading="lazy">
                    <div class="card-body">
                        <h3 class="card-title">${item.name}</h3>
                        <p class="card-text sb-desc">${item.description}</p>
                        <p class="sb-price">$ ${Utils.formatMoney(item.price)}</p>
                        <button type="button" class="btn btn-primary stretched-link">Buy for $ ${Utils.formatShortMoney(item.price)}</button>
                    </div>
                `;

                const button = itemDiv.querySelector("button");
                const badge = itemDiv.querySelector(".sb-count");
                let bought = 0;

                button.addEventListener("click", () => {
                    if (AppState.soundActive) {
                        const audio = Sounds[`cash${Math.floor(Math.random() * 5) + 1}`];
                        audio.currentTime = 0; // Allow rapid firing without waiting to finish
                        audio.play().catch(e => console.warn("Audio play blocked by browser", e));
                    }

                    button.classList.add("is-pressed");
                    setTimeout(() => button.classList.remove("is-pressed"), 200);

                    const slip = document.createElement("span");
                    slip.className = "sb-slip";
                    slip.innerHTML = `- $ ${Utils.formatShortMoney(item.price)}`;
                    itemDiv.appendChild(slip);
                    setTimeout(() => slip.remove(), 750);

                    bought++;
                    badge.innerHTML = `&times;${bought}`;
                    badge.classList.remove("is-hidden");

                    AppState.currentMoney -= item.price;
                    AppState.boughtThings.push([item.name, item.price, item.image]);
                    this.updateReadout();
                });

                column.appendChild(itemDiv);
                this.elements.itemsGrid.appendChild(column);
            });
        } catch (error) {
            Utils.showEmptyState(this.elements.itemsGrid, "The items could not be loaded. Reload the page to try again.");
        }
    }
};

window.addEventListener("load", () => {
    UI.cacheDOM();

    document.querySelector(".reset").addEventListener("click", () => {
        AppState.modal.reset = genModal(Modals.reset);
    });

    document.querySelector(".receipt").addEventListener("click", () => {
        sessionStorage.setItem("boughtItems", JSON.stringify(AppState.boughtThings));
        sessionStorage.setItem("selectedName", UI.elements.personName.innerHTML);

        AppState.modal.receipt = genModal(Modals.receipt);
        const receiptModalEl = document.getElementById(AppState.modal.receipt);
        if (receiptModalEl) {
            receiptModalEl.querySelector(".modal-content").style.height = "80%";
            receiptModalEl.querySelector(".modal-body").style.overflowY = "hidden";
        }
    });

    document.querySelector(".soundButton").addEventListener("click", (e) => {
        AppState.soundActive = !AppState.soundActive;
        const button = e.currentTarget;
        const icon = button.querySelector("i");

        if (AppState.soundActive) {
            icon.className = "bi bi-volume-up";
            button.setAttribute("aria-label", "Mute cash sounds");
        } else {
            icon.className = "bi bi-volume-mute";
            button.setAttribute("aria-label", "Unmute cash sounds");
        }
    });

    const currentYearEl = document.querySelector(".currentYear");
    if (currentYearEl) currentYearEl.innerHTML = new Date().getFullYear();

    window.addEventListener("resize", () => UI.syncPosHeight());

    UI.loadPeople();
    UI.loadItems();
});
