
if (localStorage.getItem("token") == undefined) login()
else getData()

function login() {
    document.getElementById("logger").addEventListener("click", ()=>{
    const nickmail = document.getElementById("nickmail").value
    const password = document.getElementById("pass").value

    fetch("https://zone01normandie.org/api/auth/signin", {
        method: 'POST',
        headers: {
            'Authorization':'Basic ' + btoa(nickmail + ':' + password),
        }
    }) 
    .then(response => {return response.json()})
    .then(data => {
        console.log("data: ", data);
        if (data.error != undefined) alert("Bad Username or Password")
        else {
            const jwt = data;
            localStorage.setItem("token", jwt)
            console.log(jwt);
            getData()
        }
    })
    .catch(error => console.error(error));})
}
let down = 0
let up = 0
let total_xp = 0
var ratio
var skill = {}
var xp = []
var xp_cumul = []
var xp_svg = []
var level = 0


function getData() {
    document.getElementById("disconnect-btn").addEventListener("click", () => {
        localStorage.clear()
        location.reload()
    })
    document.getElementById("profil").classList.toggle("hide")
    document.getElementById("log").classList.toggle("hide")
    const token = localStorage.getItem("token")
    fetch("https://zone01normandie.org/api/graphql-engine/v1/graphql", {  
            method: "POST", 
            headers: token && {        
                'Authorization': `Bearer ${token}`, 
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    },       
            body: JSON.stringify({         
                query: `
                {
                    transaction(
                        where: {eventId: {_eq: 32}}, order_by: {createdAt: asc}
                    ){
                        type
                        eventId
                        amount
                        path
                        
                    }
                    user{
                        firstName
                        lastName
                    }
                }
                `
                })
            })  .then(response => response.json())
                .then(data =>  {
                    console.log("data",data);
                    traitementDesDatas(data);
                })
                .catch(error => console.error(error))
    }

    function traitementDesDatas(data) {
        const info = data
        const welcomemessage = "Welcome,  "+info.data.user[0].firstName +" "+ info.data.user[0].lastName
        const welcome = document.getElementById("welcome")
        welcome.innerText = welcomemessage
        const transa = info.data.transaction
        console.log("transaction",transa);
        for (var el of transa) {
            if (el.type == "xp") {
                xp.push(el.amount)
                total_xp += el.amount
                xp_cumul.push(total_xp)
            } else if (el.type == "up") {
                up += el.amount
            } else if (el.type == "down") {
                down += el.amount
            } else if (el.type == "level") {
                if (el.amount > level) {
                    level = el.amount
                }
            }
        }
        ratio = up/down
        xp_cumul.forEach(el => {
            xp_svg.push(el*1/1600)
        })

        // représenter le ratio
        // Création de l'élément <svg> pour la barre horizontale
const ratios = document.getElementById("ratio")
const svgratio = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svgratio.setAttribute("width", "800");
svgratio.setAttribute("height", "50");

ratios.appendChild(svgratio);
const talon = 2;


const barWidth = 400-talon ;
const barHeight = 30;

// Création de l'élément <rect> pour la partie non colorée de la barre
const rect1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
rect1.setAttribute("x", talon.toString());
rect1.setAttribute("y", "10");
rect1.setAttribute("width", (2*barWidth).toString());
rect1.setAttribute("height", barHeight.toString());
rect1.setAttribute("fill", "#f1f1f1");
svgratio.appendChild(rect1);

// Création de l'élément <rect> pour la partie colorée de la barre
const rect2 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
rect2.setAttribute("x", talon.toString());
rect2.setAttribute("y", "10");
rect2.setAttribute("width", (barWidth * ratio).toString());
rect2.setAttribute("height", barHeight.toString());
rect2.setAttribute("fill", "blue");
svgratio.appendChild(rect2);
// Affichage de la valeur du ratio ou du pourcentage au-dessus de la barre
const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
text.setAttribute("x", "200");
text.setAttribute("y", "25");
text.setAttribute("font-size", "20");
text.setAttribute("text-anchor", "middle");
text.textContent = "Ratio : "+ ratio.toFixed(2).toString();
svgratio.appendChild(text);
const levels = document.getElementById("level")
levels.innerText = "Level : " + level.toString()

        console.log("xp_cumul",xp_cumul);
        console.log("nombrecumul",xp_cumul.length);
        console.log("xp_svg",xp_svg);
        console.log("total_xp",total_xp);
        console.log("up",up);
        console.log("down",down);
        console.log("ratio",ratio);
        console.log("level", level);
        for (var el of transa) {
            if ((el.type.split("_"))[0] == "skill") {
                let key = el.type.split("_")[1]
                // const uneMap = new Map()
                // uneMap.set(key, el.amount)
                if (skill[key] == undefined || el.amount > skill[key]) {
                    skill[key] = el.amount
                }
            }
        }
        console.log("skill",skill);
    let points = []
    let xpoints = []

    var step = window.innerWidth/100
    console.log("step", step);
    for (var i = 0; i < xp_cumul.length; i++) {
        const xpoint = {x: 50 + step*i, y: 800 - xp[i]/1600}
        const point = {x: 50 + step*i, y: 800 - xp_cumul[i]*1/1600}
        points.push(point)
        xpoints.push(xpoint)

    }
    console.log("points",points);
    //const svg = document.getElementById("xp-graph");
    const graphdiv = document.getElementById("graphdiv")
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    svg.setAttribute("id","xp-graph")
    svg.setAttribute("width", (0.9*window.innerWidth).toString());
    svg.setAttribute("height", "800");
    const axisColor = "black";
const axisWidth = 1;
const tickLength = 5;
const tickLabelOffset = 10;
const tickLabelSize = 10;
const axisLabelSize = 12;
const axisLabels = ["X", "Y"];
const origin = { x: 50, y: 800 };
var xMax = 100*step;
var yMax = 700;
window.onresize = sizing
function sizing() {
    points = []
    svg.innerHTML = ""
    svg.setAttribute("width", (0.9*window.innerWidth).toString());
    svg.setAttribute("height", "800");
    step = window.innerWidth/100
    console.log("step", step);
    for (var i = 0; i < xp_cumul.length; i++) {
        const point = {x: 50 + step*i, y: 800 - xp_cumul[i]*1/1600}
        const xpoint = {x: 50 + step*i, y: 800 - xp[i]/1600}
        points.push(point)
        xpoints.push(xpoint)

    }
    xMax = 100*step;
    yMax = 700;

    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", origin.x);
    xAxis.setAttribute("y1", origin.y);
    xAxis.setAttribute("x2", origin.x + xMax);
    xAxis.setAttribute("y2", origin.y);
    xAxis.setAttribute("stroke", axisColor);
    xAxis.setAttribute("stroke-width", axisWidth);
    svg.appendChild(xAxis);

    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", origin.x);
    yAxis.setAttribute("y1", origin.y);
    yAxis.setAttribute("x2", origin.x);
    yAxis.setAttribute("y2", origin.y - yMax);
    yAxis.setAttribute("stroke", axisColor);
    yAxis.setAttribute("stroke-width", axisWidth);
    svg.appendChild(yAxis);

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");


// Construction de la chaîne de commandes SVG à partir des points
    let d = "";
    let d2 = ""
    for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const xpoint = xpoints[i];

    if (i === 0) {
        d += "M " + point.x + " " + point.y + " ";
        d2 += "M " + xpoint.x + " " + xpoint.y + " ";

    } else {
        d += "L " + point.x + " " + point.y + " ";
        d2 += "M " + xpoint.x + " " + xpoint.y + " ";

    }
    }

// Définition des propriétés de la courbe
    path.setAttribute("d", d);
    path.setAttribute("stroke", "blue");
    path.setAttribute("fill", "none");
    path2.setAttribute("d", d2);
    path2.setAttribute("stroke", "red");
    path2.setAttribute("fill", "none");
    const textxp = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textxp.setAttribute("x", points[points.length - 1].x);
    textxp.setAttribute("y", points[points.length - 1].y);
    textxp.setAttribute("font-size", "15");
    textxp.setAttribute("text-anchor", "middle");
    textxp.textContent = "Total Xp : "+ xp_cumul[xp_cumul.length - 1].toString();

    const textxp2 = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textxp2.setAttribute("x", xpoints[xpoints.length - 1].x);
    textxp2.setAttribute("y", xpoints[xpoints.length - 1].y-20);
    textxp2.setAttribute("font-size", "15");
    textxp2.setAttribute("text-anchor", "middle");
    textxp2.textContent = "Xp par projet : ";

    // Ajout de la courbe à l'élément SVG
    svg.appendChild(path)
    svg.appendChild(path2)
    svg.appendChild(textxp)
    svg.appendChild(textxp2)
    graphdiv.appendChild(svg)

}

// Création de l'axe X
    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", origin.x);
    xAxis.setAttribute("y1", origin.y);
    xAxis.setAttribute("x2", origin.x + xMax);
    xAxis.setAttribute("y2", origin.y);
    xAxis.setAttribute("stroke", axisColor);
    xAxis.setAttribute("stroke-width", axisWidth);
    svg.appendChild(xAxis);

// Ajout du label de l'axe X
// const xAxisLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
// xAxisLabel.setAttribute("x", origin.x + xMax * 50 / 2);
// xAxisLabel.setAttribute("y", origin.y + 2 * tickLabelOffset);
// xAxisLabel.setAttribute("font-size", axisLabelSize);
// xAxisLabel.setAttribute("text-anchor", "middle");
// xAxisLabel.textContent = axisLabels[0];
// svg.appendChild(xAxisLabel);

// Création de l'axe Y
    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", origin.x);
    yAxis.setAttribute("y1", origin.y);
    yAxis.setAttribute("x2", origin.x);
    yAxis.setAttribute("y2", origin.y - yMax);
    yAxis.setAttribute("stroke", axisColor);
    yAxis.setAttribute("stroke-width", axisWidth);
    svg.appendChild(yAxis);

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");

// Construction de la chaîne de commandes SVG à partir des points
    let d = "";
    let d2 = ""

    for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const xpoint = xpoints[i];

    if (i === 0) {
        d += "M " + point.x + " " + point.y + " ";
        d2 += "M " + xpoint.x + " " + xpoint.y + " ";

    } else {
        d += "L " + point.x + " " + point.y + " ";
        d2 += "L " + xpoint.x + " " + xpoint.y + " ";

    }
    }

// Définition des propriétés de la courbe
    path.setAttribute("d", d);
    path.setAttribute("stroke", "blue");
    path.setAttribute("fill", "none");
    path2.setAttribute("d", d2);
    path2.setAttribute("stroke", "red");
    path2.setAttribute("fill", "none");
    const textxp = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textxp.setAttribute("x", points[points.length - 1].x);
    textxp.setAttribute("y", points[points.length - 1].y);
    textxp.setAttribute("font-size", "15");
    textxp.setAttribute("text-anchor", "middle");
    textxp.textContent = "Total Xp : "+ xp_cumul[xp_cumul.length - 1].toString();

    const textxp2 = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textxp2.setAttribute("x", xpoints[xpoints.length - 1].x);
    textxp2.setAttribute("y", xpoints[xpoints.length - 1].y-20);
    textxp2.setAttribute("font-size", "15");
    textxp2.setAttribute("text-anchor", "middle");
    textxp2.textContent = "Xp par projet";


    // Ajout de la courbe à l'élément SVG
    svg.appendChild(path)
    svg.appendChild(path2)
    svg.appendChild(textxp)
    svg.appendChild(textxp2)
    graphdiv.appendChild(svg)


    // Affichage des skills
    const skills = document.getElementById("skills")
    for (const [key, value] of Object.entries(skill)) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "200");
        svg.setAttribute("height", "220");
        const text1 = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text1.setAttribute("x", "100");
        text1.setAttribute("y", "10");
        text1.setAttribute("font-size", "15");
        text1.setAttribute("text-anchor", "middle");
        text1.textContent = "Skill-"+key+" : "+ value.toString()+"%";
        svg.appendChild(text1);
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", "100");
        circle.setAttribute("cy", "100");
        circle.setAttribute("r", "80");
        circle.setAttribute("fill", "none");
        circle.setAttribute("stroke", "black");
        //circle.setAttribute("stroke-width", "20");
        svg.appendChild(circle);

        const percentage = value;
        const angle = percentage / 100 * 360;
        const startX = 100 + Math.sin(angle / 180 * Math.PI) * 80;
        const startY = 100 - Math.cos(angle / 180 * Math.PI) * 80;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", `M 100,100 L 100,20 A 80,80 0 ${angle > 180 ? "1" : "0"},1 ${startX},${startY} z`);
        path.setAttribute("fill", "blue");
        svg.appendChild(path);
        skills.appendChild(svg)
    }
    } 
    
                    
