//when page load
window.addEventListener('load', function () {
    document.querySelector(".reset").addEventListener("click", function () {
        document.querySelector(".selectedPerson").classList.add("d-none");
        document.querySelector(".itemsForSale").classList.add("d-none");
        document.querySelector(".people").style.display = "flex";
    });

    document.querySelector(".receipt").addEventListener("click", function () {
        //save bought items to local storage
        sessionStorage.setItem("boughtItems", JSON.stringify(boughtThings));

        //save selected name
        sessionStorage.setItem("selectedName", document.querySelector(".selectedPersonName").innerHTML);


        //go to receipt page on new tab
        window.open("receipt.html", "_blank");
    });
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
                    <p class="card-text"><b>${person.money / 1000000000 }</b> billion $</p>
                    <span class="btn btn-primary stretched-link">Choose ${person.name}</span>
                </div>
            `;
            personDiv.querySelector('span').addEventListener('click', () => {
                boughtThings = [];
                currentMoney = person.money;

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
                    <p class="card-text"><b>${newMoney}</b> $</p>
                    <span class="btn btn-primary stretched-link">Buy ${item.name}</span>
                </div>
            `;
            itemDiv.querySelector('span').addEventListener('click', () => {
                //change button to green
                itemDiv.querySelector('span').classList.add('btn-success');
                //change button back to blue
                setTimeout(() => {
                    itemDiv.querySelector('span').classList.remove('btn-success');
                }, 300);


                currentMoney -= item.price;
                document.querySelector(".selectedPersonMoney").innerHTML = currentMoney.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

                //if money is less than 0
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