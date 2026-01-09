var modalId = 0;
var soundActive = true;

var resetModal = {
    global : {
        closable : true,
        size : "md",
        scrollable : false,
        position : "center",
    },
    header : {
        title : "Reset",
        closeButton: true,
    },
    main : {
        content : "Are you sure you want to reset your progress?",
    },
    footer : {
        buttons : {
            close : {
                text : "Cancel",
                type : "secondary",
                function : "close",
            },
            function : {
                text : "<i class='bi bi-arrow-counterclockwise ms-0 me-1'></i> Reset",
                type : "danger",
                function : "function",
                dataset : function() {
                    document.querySelector(".selectedPerson").classList.add("d-none");
                    document.querySelector(".itemsForSale").classList.add("d-none");
                    document.querySelector(".people").style.display = "flex";
                    closeModal(modalId);
                }
            }
        }
    }
}

var receiptModal = {
    global : {
        closable : true,
        size : "lg",
        scrollable : true,
        position : "center",
    },
    header : {
        title : "Receipt",
        closeButton: true,
    },
    main : {
        content : "<iframe src='receipt.html' style='width: 100%; height: 100%; border: none;'></iframe>",
    },
    footer : {
        buttons : {
            close : {
                text : "Close",
                type : "secondary",
                function : "close",
            },
            function : {
                text : "<i class='bi bi-printer ms-0 me-1'></i> Print",
                type : "primary",
                function : "function",
                dataset : function() {
                    document.querySelector("iframe").contentWindow.print();
                }
            }
        }
    }
}


//when page load
window.addEventListener('load', function () {
    document.querySelector(".reset").addEventListener("click", function () {
        modalId = genModal(resetModal);
    });

    document.querySelector(".receipt").addEventListener("click", function () {
        //save bought items to local storage
        sessionStorage.setItem("boughtItems", JSON.stringify(boughtThings));

        //save selected name
        sessionStorage.setItem("selectedName", document.querySelector(".selectedPersonName").innerHTML);
        
        let id = genModal(receiptModal);
        document.querySelector("#" + id + " .modal-content").style.height = "80%";
        document.querySelector("#" + id + " .modal-body").style.overflowY = "hidden";
    });

    document.querySelector(".soundButton").addEventListener("click", function () {
        soundActive = !soundActive;
        if (soundActive) {
            document.querySelector(".soundButton i").classList.add("bi-volume-up");
            document.querySelector(".soundButton i").classList.remove("bi-volume-mute");
        } else {
            document.querySelector(".soundButton i").classList.add("bi-volume-mute");
            document.querySelector(".soundButton i").classList.remove("bi-volume-up");
        }
    });

    document.querySelector(".currentYear").innerHTML = new Date().getFullYear();
});

var currentMoney = 0;
var boughtThings = [];


//load people.json into .people
fetch('partials/json/people.json')
    .then(response => response.json())
    .then(data => {
        data = Object.values(data);
        data.forEach(person => {
            let personDiv = document.createElement('div');
            personDiv.classList.add('person');
            personDiv.classList.add('card');
            personDiv.classList.add('text-center');
            personDiv.classList.add('m-3');
            personDiv.style = 'width: 18rem;';
            personDiv.innerHTML = `
                <img src="${person.image}" class="card-img-top" alt="${person.name} photo">
                <div class="card-body">
                    <h5 class="card-title">${person.name}</h5>
                    <p class="card-text"><b>$ ${person.money / 1000000000 }</b> billion</p>
                    <span class="btn btn-primary stretched-link">Choose ${person.name}</span>
                </div>
            `;
            personDiv.querySelector('span').addEventListener('click', () => {
                boughtThings = [];
                currentMoney = person.money;
                document.querySelector(".selectedPersonMoney").classList.remove('text-danger');

                document.querySelector(".selectedPersonPhoto").src = person.image;
                document.querySelector(".selectedPersonPhoto").setAttribute("alt", person.name);
                document.querySelector(".selectedPersonName").innerHTML = person.name;
                //split money by 3 zeros
                document.querySelector(".selectedPersonMoney").innerHTML = person.money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                
                document.querySelector(".people").style.display = "none";
                document.querySelector(".selectedPerson").classList.remove("d-none");
                document.querySelector(".itemsForSale").classList.remove("d-none");
            });
            document.querySelector('.people').appendChild(personDiv);
        });
    }
);

//load items.json into itemsForSale
fetch('partials/json/items.json')
    .then(response => response.json())
    .then(data => {
        data = Object.values(data);
        data.forEach(item => {
            let itemDiv = document.createElement('div');
            itemDiv.classList.add('item');
            itemDiv.classList.add('card');
            itemDiv.classList.add('text-center');
            itemDiv.classList.add('m-3');
            itemDiv.style = 'width: 18rem;';
            let newMoney = item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            itemDiv.innerHTML = `
                <img src="${item.image}" class="card-img-top" alt="${item.name} photo">
                <div class="card-body">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text">${item.description}</p>
                    <p class="card-text"><b>$ ${newMoney}</b></p>
                    <span class="btn btn-primary stretched-link">Buy ${item.name}</span>
                </div>
            `;
            itemDiv.querySelector('span').addEventListener('click', () => {
                //play sound
                if (soundActive) {
                    let audio;
                    if (Math.random() < 0.5) {
                        audio = new Audio('partials/sounds/cash1.mp3');
                    } else {
                        audio = new Audio('partials/sounds/cash2.mp3');
                    }
                    audio.play();
                }


                //change button to darker
                itemDiv.querySelector('span').style.backgroundColor = "#064b94";
                //change button back to blue
                setTimeout(() => {
                    itemDiv.querySelector('span').removeAttribute("style");
                }, 300);


                currentMoney -= item.price;
                document.querySelector(".selectedPersonMoney").innerHTML = currentMoney.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

                if (currentMoney < 0) {
                    document.querySelector(".selectedPersonMoney").classList.add('text-danger');
                }
                
                //new bought item
                let boughtItem = [];
                boughtItem.push(item.name, item.price, item.image);

                //add bought item to boughtThings object
                boughtThings.push(boughtItem);
            });
            document.querySelector('.itemsForSale').appendChild(itemDiv);
        });
    }
);