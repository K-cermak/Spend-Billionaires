//when page load
window.addEventListener('load', function () {
    document.querySelector(".reset").addEventListener("click", function () {
        document.querySelector(".selectedPerson").classList.add("d-none");
        document.querySelector(".itemsForSale").classList.add("d-none");
        document.querySelector(".people").style.display = "flex";
    });
});


//load people.json
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
                    <p class="card-text">$ ${person.money / 1000000000 } billion</p>
                    <span class="btn btn-primary stretched-link">Choose ${person.name}</span>
                </div>
            `;
            personDiv.querySelector('span').addEventListener('click', () => {
                let personName = person.name;
                let personMoney = person.money;
                let personImage = person.image;

                document.querySelector(".selectedPersonPhoto").src = personImage;
                document.querySelector(".selectedPersonPhoto").setAttribute("alt", personName);
                document.querySelector(".selectedPersonName").innerHTML = personName;
                //split money by 3 zeros
                document.querySelector(".selectedPersonMoney").innerHTML = personMoney.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                
                document.querySelector(".people").style.display = "none";
                document.querySelector(".selectedPerson").classList.remove("d-none");
                document.querySelector(".itemsForSale").classList.remove("d-none");
                console.log(personName, personMoney, personImage);
            });
            document.querySelector('.people').appendChild(personDiv);
        });
    }
);