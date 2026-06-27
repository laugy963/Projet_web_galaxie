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
let sparks = []; // etincelles d'explosion ephemeres (pur visuel, pas de gravite)
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
            gererCollisions(particles);
            ctx.shadowBlur = 0; // pas de halo sur l'effacement (sinon flou couteux sur tout le canvas)
            ctx.fillStyle = "rgba(4,5,13,0.2)"; // effacement semi-transparent -> trainees orbitales (couleur du fond du theme)
            ctx.fillRect(0,0,canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++)
            {
                particles[i].draw();
            }
            dessineExplosions(0.02);
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
    // vitesse orbitale circulaire autour du corps central -> la particule orbite au lieu de tomber droit
    let cx = canvas.getAttribute("width") / 2;
    let cy = canvas.getAttribute("height") / 2;
    let dx = mouseX - cx;
    let dy = mouseY - cy;
    let r = Math.sqrt(dx * dx + dy * dy);
    if(r > 1) // evite la division par zero si on clique pile au centre
    {
        let vitesse = Math.sqrt(particles[0].masse / r); // v = sqrt(G*M/r), G=1, M = masse centrale
        p.vx = -vitesse * dy / r; // perpendiculaire au rayon -> orbite circulaire
        p.vy = vitesse * dx / r;
    }
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

// Detecte les collisions et fusionne les corps qui se touchent
function gererCollisions(particles)
{
    for(let i = 0; i < particles.length; i++) // ponytail: O(n^2), suffisant pour ~20 corps
    {
        for(let j = i + 1; j < particles.length; j++)
        {
            let dx = particles[j].x - particles[i].x;
            let dy = particles[j].y - particles[i].y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if(dist < particles[i].radius + particles[j].radius) // les disques se touchent
            {
                let absorbe = fusionner(particles[i], particles[j]); // collision inelastique : le plus massif absorbe l'autre
                particles.splice(particles.indexOf(absorbe), 1);
                i--; // le survivant a change, on le re-teste contre le reste (reactions en chaine)
                break;
            }
        }
    }
}

// Collision parfaitement inelastique (accretion) : conserve masse + quantite de mouvement.
// Le corps fixe, sinon le plus massif, survit et absorbe l'autre. Retourne le corps absorbe.
function fusionner(a, b)
{
    let gros, petit;
    if(!a.Move) { gros = a; petit = b; }                          // corps fixe (soleil) = survivant
    else if(!b.Move) { gros = b; petit = a; }
    else if(Number(a.masse) >= Number(b.masse)) { gros = a; petit = b; } // sinon le plus massif
    else { gros = b; petit = a; }

    let ma = Number(a.masse); // Number() : masse peut etre une string (slider.value au double-clic)
    let mb = Number(b.masse);
    let mTot = ma + mb;
    if(gros.Move) // un corps fixe garde position et vitesse (inertie ~ infinie), sinon on applique les conservations
    {
        gros.vx = (ma * a.vx + mb * b.vx) / mTot; // conservation de la quantite de mouvement
        gros.vy = (ma * a.vy + mb * b.vy) / mTot;
        gros.x = (ma * a.x + mb * b.x) / mTot;     // position = centre de masse
        gros.y = (ma * a.y + mb * b.y) / mTot;
    }
    gros.masse = mTot;
    gros.radius = Math.cbrt(gros.radius ** 3 + petit.radius ** 3); // rayon a volume conserve
    spawnExplosion(petit.x, petit.y, petit.couleur); // debris ejectes / flash d'impact
    return petit;
}

// Cree une explosion : etincelles qui fusent + anneau de choc, au point (x, y)
function spawnExplosion(x, y, color)
{
    let n = 18;
    for(let k = 0; k < n; k++)
    {
        let ang = 2 * Math.PI * k / n + Math.random();
        let speed = generateNumber(40, 160);
        sparks.push({
            x: x, y: y,
            vx: Math.cos(ang) * speed,
            vy: Math.sin(ang) * speed,
            life: 1, // 1 -> 0
            color: color,
            radius: generateNumber(1, 4)
        });
    }
    sparks.push({ x: x, y: y, vx: 0, vy: 0, life: 1, color: "#ffffff", radius: 0, ring: true });
}

// Met a jour et dessine les etincelles d'explosion, retire celles eteintes
function dessineExplosions(dt)
{
    for(let k = 0; k < sparks.length; k++)
    {
        let s = sparks[k];
        s.life = s.life - dt; // disparait en ~0.5 s
        if(s.life <= 0)
        {
            sparks.splice(k, 1);
            k--;
            continue;
        }
        ctx.beginPath();
        if(s.ring) // anneau de choc qui s'agrandit en s'estompant
        {
            ctx.strokeStyle = "rgba(255,255,255," + s.life + ")";
            ctx.lineWidth = 2;
            ctx.shadowBlur = 12;
            ctx.shadowColor = "#ffffff";
            ctx.arc(s.x, s.y, (1 - s.life) * 60, 0, Math.PI * 2);
            ctx.stroke();
        }
        else // etincelle qui fuse et s'estompe
        {
            s.x = s.x + s.vx * dt;
            s.y = s.y + s.vy * dt;
            ctx.globalAlpha = s.life;
            ctx.fillStyle = s.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = s.color;
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
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
    sparks = [];
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(4,5,13,1)"; // efface tout le canvas (fond du theme)
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    slider.value = 250;
    masse.value = slider.value; // resynchronise la case masse avec le slider au (re)demarrage
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