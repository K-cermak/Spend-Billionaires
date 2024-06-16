window.addEventListener('load', function () {
    //load data from local storage and console it   
    var boughtThings = JSON.parse(sessionStorage.getItem("boughtItems"));

    document.querySelector(".selectedPersonName").innerHTML = sessionStorage.getItem("selectedName");;

    let totalPrice = 0;

    //if boughtThings is not null

    if (boughtThings == null) {
        boughtThings = [];
    }

    //print to .receiptItems
    boughtThings.forEach(item => {
        totalPrice += Number(item[1]);
        item[1] = item[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

        let itemDiv = document.createElement('div');
        itemDiv.classList.add('m-3');
        itemDiv.style = 'width: 18rem;';
        itemDiv.innerHTML = `
                <h5>${item[0]}</h5>
                <p>&nbsp; - ${item[1]} $</p>
        `;
        document.querySelector('.receiptItems').appendChild(itemDiv);
    });

    if (totalPrice == 0) {
        document.querySelector(".receiptItems").innerHTML = "You didn't buy anything";
    }

    document.querySelector(".totalPrice").innerHTML = totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
});