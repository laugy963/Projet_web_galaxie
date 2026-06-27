/* Code JS concu par King Lau et Sylvain Mazzoleni pour le projet web en L1S2 */



// Declarations des variables utile dans tout le JavaScript

// Constante permettant d'interagir avec le HTML et le CSS
const canvas = document.getElementById("affichage");
const ctx = canvas.getContext("2d");
const masse = document.getElementById("masse");
const slider = document.getElementById("slider");
const Startbouton = document.getElementById("Startbouton");
const Stopbouton = document.getElementById("Stopbouton");

// Variable permettant de rentrer et/ou sortir de certaine conditions dans certaines fonctions
let nombreDeParticule = 21; // Nombre de particules afficher au chargement de la page
let particles = []; // Tableau de toutes les particules creer
let intervalID; // Permet de gerer l'activation et l'arret de la simulation
let SimulationMode = false; // Permet de savoir si la simulation est en cour ou non
const softening = 5; // adoucissement gravitationnel (px) : borne la force lors des rencontres tres proches (r -> 0)

// Fonction permettant d'obtenir une couleur aleatoire
function getRandomColor() 
{
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++)
    {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Fonction permettant d'obtenir un nombre aleatoire
function generateNumber(min, max)
{
    return Math.floor((Math.random()*(max-min))+min);
}


// fonction jQuery pour afficher/masquer les controles lorsqu'un click est detecter avec une animation de "slide" 
$(document).ready(function () 
{
    const Hidebouton = $("#Hidebouton");
    const controle = $("#Controle");
    var Visible = 1;
    Hidebouton.click(function () 
    {
        if(Visible === 0)
        {
            controle.slideDown(500, function () 
            {
                Hidebouton.text("↑ Masquer les contrôles");
                Visible = 1;
            });
        }
        else
        {
            controle.slideUp(500, function () 
            {
                Hidebouton.text("↓ Afficher les contrôles");
                Visible = 0;
            });
        }
    });
});

// Affichage constant de la valeur du slider pour la masse de la particule a ajouter
slider.oninput = function () 
{
    masse.value = slider.value;
};

masse.onchange = function ()
{
    const SliderNewValue = parseInt(masse.value);
    if(!isNaN(SliderNewValue))
    {
        if(SliderNewValue >= parseInt(slider.max))
        {
            masse.value = slider.max;
        }else if(SliderNewValue <= parseInt(slider.min))
        {
            masse.value = slider.min;
        }
        slider.value = SliderNewValue;
    }
    else
    {
        slider.value = slider.max / 2;
        masse.value = slider.max / 2;
    }
};

// Gestions des boutons start et stop des animations

// Fonction attendant un click sur le boutton Start
Startbouton.onclick = function ()
{
    if(!SimulationMode)
    {
        SimulationMode = true;
        intervalID = setInterval(function()
        {
            calculDesMouvements(particles, 0.02);
            ctx.shadowBlur = 0; // pas de halo sur l'effacement (sinon flou couteux sur tout le canvas)
            ctx.fillStyle = "rgba(4,5,13,0.2)"; // effacement semi-transparent -> trainees orbitales (couleur du fond du theme)
            ctx.fillRect(0,0,canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++)
            {
                particles[i].draw();
            }
        }, 10);
    }
};

// Fonction attendant un click sur le boutton Stop
Stopbouton.onclick = function ()
{
    if(SimulationMode)
    {
        SimulationMode = false;
        clearInterval(intervalID);
    }
};

// Declarations de la classe Particule
class Particle
{

    // Elements du canvas
    canvas = document.getElementById("affichage");
    ctx = canvas.getContext("2d");

    // Object var
    masse;
    x;
    y;
    couleur;
    Move = true;
    radius = 10;
    vx = 0; // velocite en x
    vy = 0; // velocite en y
    fx = 0; // force en x
    fy = 0; // force en y

    // Constructeur
    constructor(masse, x, y, color)
    {
        this.masse = masse;
        this.x = x;
        this.y = y;
        this.couleur = color;
    }

    // Fonction permettant l'affichage de la particule
    draw()
    {
        ctx.beginPath();
        ctx.fillStyle = this.couleur;
        ctx.shadowBlur = this.radius; // halo lumineux proportionnel a la taille -> rendu "etoile"
        ctx.shadowColor = this.couleur;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.fill();
    }
}

// Fonction attendant un double click sur le canvas pour afficher une nouvelle particule
canvas.ondblclick = function(event)
{
    let mouseX = event.pageX - canvas.offsetLeft;
    let mouseY = event.pageY - canvas.offsetTop;
    let masse = slider.value;
    let color = getRandomColor();
    let radius;
    if(masse < 10)
    {
        radius = 1;
    }
    else
    {
        radius = masse / 20;
    }
    let p = new Particle(masse, mouseX, mouseY, color);
    p.radius = radius;
    p.draw();
    particles.push(p);
};

// Fonction calculant les deplacements des particules
function calculDesMouvements(particles, dt)
{
    for(let i = 0; i < particles.length; i++)
    {
        if(particles[i].x < 0 || particles[i].x > canvas.getAttribute("width")) // supprime la particule si elle sort du canvas
        {
            particles.splice(i, 1);
            i--;
        }
        else if(particles[i].y < 0 || particles[i].y > canvas.getAttribute("height")) // supprime la particule si elle sort du canvas
        {
            particles.splice(i, 1);
            i--;
        }
        else if(particles[i].Move) // Si pas supprimer la particule bouge
        {
            particles[i].fx = 0;
            particles[i].fy = 0;
            for(let j = 0; j < particles.length; j++)
            {
                if(i !== j)
                {
                    let dx = particles[j].x - particles[i].x;
                    let dy = particles[j].y - particles[i].y;
                    let r2 = dx ** 2 + dy ** 2 + softening ** 2; // distance au carre adoucie (Plummer) : pas de singularite quand r -> 0
                    let r = Math.sqrt(r2);
                    let f = 1 * particles[i].masse * particles[j].masse / r2; // vraie force de Newton F = G*mi*mj/(r^2+eps^2) (G=1)
                    particles[i].fx = particles[i].fx + f * dx / r;
                    particles[i].fy = particles[i].fy + f * dy / r;
                }
                let ax = particles[i].fx / particles[i].masse;
                let ay = particles[i].fy / particles[i].masse;
                particles[i].vx = particles[i].vx + ax * dt;
                particles[i].vy = particles[i].vy + ay * dt;
                particles[i].x = particles[i].x + particles[i].vx * dt;
                particles[i].y = particles[i].y + particles[i].vy * dt;
            }
        }
    }
}

// Creation de la particule lourde et fixe au centre du canvas
function createBigParticule() 
{
    let masse = 3000;
    let color = "#f6ff07";
    let x = canvas.getAttribute("width") / 2;
    let y = canvas.getAttribute("height") / 2;
    let bp = new Particle(masse, x, y, color);
    bp.Move = false;
    bp.radius = 30;
    bp.draw();
    return bp;
}

// Initialisation, particules au chargement de la pages
function initSimulation()
{
    particles = [];
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(4,5,13,1)"; // efface tout le canvas (fond du theme)
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    slider.value = 250;
    particles.push(createBigParticule());
    for(let i = 1; i < nombreDeParticule; i++)
    {
        let masse = generateNumber(10, 100);
        let radius = 0.0;
        let ang = 2 * Math.PI * i / nombreDeParticule;
        let color =  getRandomColor();
        if(masse < 50)
        {
            radius = generateNumber(50, 100);
        }
        else
        {
            radius = generateNumber(100, 200);
        }
        let x = canvas.getAttribute("width") / 2 + radius * Math.sin(ang);
        let y = canvas.getAttribute("height") / 2 + radius * Math.cos(ang);
        let p = new Particle(masse, x, y, color);
        p.radius = masse / 20; // taille visuelle proportionnelle a la masse (masse 10-100 -> rayon 0.5-5)
        let vitesse = Math.sqrt(particles[0].masse / radius); // vitesse orbitale circulaire v = sqrt(G*M/r), G=1, M = masse centrale
        p.vx = -vitesse * Math.cos(ang);
        p.vy = vitesse * Math.sin(ang);
        p.draw();
        particles.push(p);
    }
}

initSimulation();

// Bouton recommencer : arrete la simulation en cours et reinitialise les particules
const Restartbouton = document.getElementById("Restartbouton");
Restartbouton.onclick = function ()
{
    if(SimulationMode)
    {
        SimulationMode = false;
        clearInterval(intervalID);
    }
    initSimulation();
};