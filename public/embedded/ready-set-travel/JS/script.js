let place1Photo ="tour-mountainHiking.jpg";
let place1Name ="Alps Mountain Hiking Tour";
let place1Time ="4 days | 10 stops";
let place1Price = "$1,500";

let place2Name ="Snorkel the Barrier Reef Tour";
let place2Time ="2 days | 2 stops";
let place2Price = "$1,000";


let place3Name="Tour the Pyramids on Camelback";
let place3Time="2 days | 2 stops";
let place3Price= "$2,000";

//student list using objects

let Place1 = {
    Name:"Alps Mountain Hiking Tour", //Key:value pair = proprty
    Time:"4 days | 10 stops",
    Price:"$1,500"
};
let Place2 = {
    Name:"Snorkel the Barrier Reef Tour",
    Time:"2 days | 2 stops",
    Price:"$1,000"
};
let Place3 = {
    Name:"Tour the Pyramids on Camelback", 
    Time:"2 days | 2 stops",
    Price:"$2,000"
};
document.getElementById("Name1").innerHTML=Place1.Name;
document.getElementById("Time1").innerHTML=Place1.Time;
document.getElementById("Price1").innerHTML=Place1.Price;

document.getElementById("Name2").innerHTML=Place2.Name;
document.getElementById("Time2").innerHTML=Place2.Time;
document.getElementById("Price2").innerHTML=Place2.Price;

document.getElementById("Name3").innerHTML=Place3.Name;
document.getElementById("Time3").innerHTML=Place3.Time;
document.getElementById("Price3").innerHTML=Place3.Price;

