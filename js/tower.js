function handleClick(){
    let value = parseInt(document.getElementById("move").value);
    if (isNaN(value) || value < 0 || value > 1125899906842623){
        let node = document.getElementById("message");
        node.textContent = "Please Enter A Move Number Between 0 and 1125899906842623";
    }
    else{
        let node = document.getElementById("message");
        node.textContent = "";
        for (let i = 0; i < 50; i++){
            let peg = value + (2**i);
            peg = Math.floor(peg/(2**(i+1)));
            peg = peg * ((-1)**(i-100));
            console.log(peg);
            peg = mod(peg, 3);
            console.log(peg);
    
            let id = "" + i;
            let node = document.getElementById(id);
            node.textContent = peg;
        }
    }

    function mod(n, m) {
        return ((n % m) + m) % m;
      }
}
