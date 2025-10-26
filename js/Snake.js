const canvas  = document.getElementById('canvas');
const audio_Fondo = new Audio('audio/fondo.mp3');
const audio_colision = new Audio('audio/collision.mp3');
const ctx = canvas.getContext('2d');
const menu = document.querySelector('.menu');
const score = document.querySelector('.score');
const timer = document.querySelector('.timer');
const canvas2 = document.getElementById('snake-1');
const canvas3 = document.getElementById('snake-2');




const ctx2 = canvas2.getContext('2d');
const ctx3 = canvas3.getContext('2d');

canvas2.width = 250;
canvas2.height = 100;

canvas3.width = 250;
canvas3.height = 100;

let play = false;
let scoreP = 0;
let timeP = 0;

canvas.width = 900;
canvas.height = 600;
class Apple{
    constructor(position, radio, color, context, audio){
        this.position = position;
        this.radio = radio;
        this.color = color;
        this.context = context;
        this.audio = audio;
    }
    draw(){
        this.context.save();
        this.context.beginPath(); //Indicamos que vamos a dibujar una nueva figura
        this.context.arc(this.position.x, this.position.y, this.radio, 0, Math.PI * 2);
        this.context.fillStyle = this.color;
        this.context.shadowColor = this.color;
        this.context.shadowBlur = 20;
        this.context.fill();
        this.context.closePath(); 
        this.context.restore();
    }
    collition(snake){
        let v = {
            x: this.position.x - snake.position.x,
            y: this.position.y - snake.position.y
        }
        let distance = Math.sqrt(
            (v.x * v.x) + (v.y * v.y)
        );

        if(distance < this.radio + snake.radio){
            this.position = {
                x: Math.floor(Math.random() *
                ((canvas.width - this.radio) - this.radio + 1)) + this.radio,
                y: Math.floor(Math.random() * 
                ((canvas.height - this.radio) - this.radio + 1) ) + this.radio,
            }
            snake.createBody();
            scoreP += 1;
            score.textContent = `Score: ${scoreP}`;
            this.audio.currentTime = 0;
            this.audio.play();
            this.audio.volume = 0.2;
            // Aumentar la velocidad del snake cada punto
            snake.velocity += 0.1;
            
        }

    }
}
class SnakeBody{
    constructor(radio, color, context, path){
        this.radio = radio;
        this.color = color;
        this.context = context;
        this.path = path; // arreglo de posiciones por las que ha pasado la cabeza
        this.transparency = 1;
    }
    drawCircle(x, y, radio, color){
        this.context.save();
        this.context.beginPath(); //Indicamos que vamos a dibujar una nueva figura
        this.context.arc(x, y, radio, 0, Math.PI * 2);
        this.context.fillStyle = color;
        this.context.globalAlpha = this.transparency; // 1 opaco 0 transparente
        this.context.shadowColor = this.color;
        this.context.shadowBlur = 20;
        this.context.fill();
        this.context.closePath(); //Cerramos la figura  
        this.context.restore();
    }
    draw(){
        this.drawCircle(this.path.slice(-1)[0].x , this.path.slice(-1)[0].y, this.radio, this.color);
    }
}

class Snake{
    constructor(position, radio, color, velocity,length,pathLength, context){
        this.position = position;
        this.radio = radio;
        this.color = color;
        this.velocity = velocity;
        this.context = context;
        this.rotation = 0;
        this.transparency = 1;
        this.isDead = false;
        this.length = length;
        this.pathLength = pathLength;
        this.body = [];
        this.keys = {
            A : false,
            D: false,
            enabled: true
        }
        this.keyboard();
    }
    initializeBody(){
        for(let i = 0; i < this.length ; i++){
            let path = [];
            for(let k = 0; k < this.pathLength ; k++){
                path.push({
                    x: this.position.x, 
                    y: this.position.y
                });
            }
            this.body.push(new SnakeBody(this.radio, this.color, this.context, path));
        }
    }
    drawCircle(x, y, radio, color,shadowColor){
        this.context.save();
        this.context.beginPath(); //Indicamos que vamos a dibujar una nueva figura
        this.context.arc(x, y, radio, 0, Math.PI * 2);
        this.context.fillStyle = color;
        this.context.globalAlpha = this.transparency; // 1 opaco 0 transparente
        this.context.shadowColor = shadowColor;
        this.context.shadowBlur = 20;
        this.context.fill();
        this.context.closePath(); //Cerramos la figura 
        this.context.restore(); 
    }
    createBody(){
        let path = [];
        for(let k = 0; k < this.pathLength ; k++){
            path.push({
                x: this.body.slice(-1)[0].path.slice(-1)[0].x, 
                y: this.body.slice(-1)[0].path.slice(-1)[0].y
            });
        }
        this.body.push(new SnakeBody(this.radio, this.color, this.context, path));
        if(this.pathLength < 8){
            this.body.push(new SnakeBody(this.radio, this.color, this.context,[...path] ));
            this.body.push(new SnakeBody(this.radio, this.color, this.context,[...path] ));
            this.body.push(new SnakeBody(this.radio, this.color, this.context,[...path] ));
        }
    }
    drawHead(){
        //cara
        this.drawCircle(this.position.x, this.position.y, this.radio, this.color, this.color);

        // primer ojo
        //ojo 
        this.drawCircle(this.position.x, this.position.y-9, this.radio - 8, "white","transparent");
        //pupila
        this.drawCircle(this.position.x + 1, this.position.y - 9 , this.radio - 12, "black","transparent");
        // iris
        this.drawCircle(this.position.x +3 , this.position.y -8, this.radio - 15, "white","transparent");

        // segundo ojo
        this.drawCircle(this.position.x, this.position.y+9, this.radio - 8, "white","transparent");
        this.drawCircle(this.position.x + 1, this.position.y +9, this.radio - 12, "black","transparent");
        this.drawCircle(this.position.x +3, this.position.y +8, this.radio - 15, "white","transparent");
    }
    drawBody(){
        this.body[0].path.unshift({
            x: this.position.x,
            y: this.position.y 
        })
        this.body[0].draw();
        for(let i = 1 ; i < this.body.length ; i++){
            this.body[i].path.unshift(this.body[i-1].path.pop());
            this.body[i].draw();
        }
        this.body[this.body.length -1].path.pop();
    }
    draw(){ 
        this.context.save();
        //Hacemos que la cabeza gire pero no al rededor del (0,0) sino de su propia posicion
        this.context.translate(this.position.x, this.position.y);
        this.context.rotate(this.rotation);
        // Reseteamos la traslacion
        this.context.translate(-this.position.x, -this.position.y);
        this.drawHead();
        this.context.restore();
    } 
    update(){
        if(this.isDead){
            this.transparency -= 0.01;
            // Mantener la transparencia del cuerpo sincronizada con la cabeza durante la animación de muerte
            this.body.forEach(e => { e.transparency = this.transparency; });
            if(this.transparency <= 0){
                play = false;
                menu.style.display = 'flex';
                return;
            }
        }
        this.drawBody();
        this.draw();
        
        if(this.keys.A && this.keys.enabled){
            this.rotation -= 0.04 ;
        }
        if(this.keys.D && this.keys.enabled){
            this.rotation += 0.04;
        }
        this.position.x += Math.cos(this.rotation)*this.velocity;
        this.position.y += Math.sin(this.rotation)*this.velocity;
        this.collision_p();
        // Verificar colisión con el propio cuerpo cada frame
        this.collision_Body();
    }
    collision_p(){
        if (this.position.x - this.radio <= 0 || this.position.x + this.radio >= canvas.width || (this.position.y - this.radio <= 0 || this.position.y + this.radio >= canvas.height)){
            this.death();
        }
    }
    collision_Body(){
        // Verifica colisión de la cabeza con los segmentos del cuerpo
        // Calculamos dinámicamente cuántos segmentos saltar según el espaciado real del cuerpo
        const hx = this.position.x;
        const hy = this.position.y;
        const hr = this.radio;

        // Distancia mínima entre centros para considerar colisión
        const vel = Math.max(0.1, this.velocity); // evitar división por 0
        const rSum = hr + (this.body.length ? this.body[0].radio : hr);
        // Saltamos los segmentos que están más cerca que el diámetro efectivo 
        const minSegmentsBySpacing = Math.ceil((rSum + 2) / (this.pathLength * vel));
        const skip = Math.max(4, minSegmentsBySpacing);
        
        for (let i = skip; i < this.body.length; i++) {
            const seg = this.body[i];
            const p = seg.path[seg.path.length - 1]; // posición actual dibujada del segmento
            const dx = hx - p.x;
            const dy = hy - p.y;
            
            // Usamos distancia al cuadrado para evitar sqrt
            if ((dx * dx + dy * dy) <= (rSum * rSum)) {
                this.death();
                return true;
            }
        }
        
        return false;
    }
    death(){
        this.isDead = true;
        this.velocity = 0;
        this.keys.enabled = false;
        this.body.forEach( e => {
            let lastItem = e.path[e.path.length -1];
            for(let i = 0 ; i < e.path.length ; i++){
                e.path[i] = lastItem;
            }
            e.transparency = this.transparency;
        });
    }
    drawCharacter(){
        for(let i = 0 ; i < this.length ; i++){
            this.drawCircle(
                this.position.x -(this.pathLength * this.velocity * i),
                this.position.y,
                this.radio,
                this.color,
                this.color
            )
        }
        this.drawHead();
    }
    keyboard(){
        // cuando estamos presionando alguna tecla A o D
        document.addEventListener('keydown', (event) => {
            if(event.key == 'a' || event.key == 'A'){
                this.keys.A = true;
            }
            if(event.key == 'd' || event.key == 'D'){
                this.keys.D = true;
            }
        });
        // cuando dejamos de presionar alguna tecla A o D
        document.addEventListener('keyup', (event) => {
            if(event.key == 'a' || event.key == 'A'){
                this.keys.A = false;
            }
            if(event.key == 'd' || event.key == 'D'){
                this.keys.D = false;
            }
        });
    }

}

const snake = new Snake({x:200, y:200}, 17, "#456190ff", 1, 3, 12, ctx);
snake.initializeBody();
const apple = new Apple({x:400, y:300}, 11, "red", ctx, audio_colision);
const snakeP1 = new Snake({x:165, y:40}, 17, "#ff5733ff", 1.5, 8, 12, ctx2);
snakeP1.initializeBody();
snakeP1.drawCharacter();
const snakeP2 = new Snake({x:165, y:40}, 17, "#33ff57ff", 1.5, 24, 4, ctx3);
snakeP2.initializeBody();
snakeP2.drawCharacter();
canvas2.addEventListener('click', () => {
    init(3, 12, "#ff5733ff");
});
canvas3.addEventListener('click', () => {
    init(8, 5, "#33ff57ff");
});
function init(length, pathLength, color){
    snake.body.length = 0;
    snake.length = length;
    snake.color = color;
    snake.pathLength = pathLength;
    snake.position = {x:200, y:200};
    snake.isDead = false;
    snake.velocity = 1;
    snake.transparency = 1;
    snake.initializeBody();
    snake.keys.enabled = true;
    play = true;
    menu.style.display = 'none';
    scoreP = 0;
    timeP = 0;
    timer.textContent = `00:00`;
    score.textContent = `Score: ${scoreP}`;
    audio_Fondo.currentTime = 0;
    audio_Fondo.play();
    audio_Fondo.volume = 0.2;

}
//Dibujado del fondo del juego
function background(){
    ctx.fillStyle = "#717170ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for(let i = 0 ; i < canvas.height; i += 50){
        for(let j = 0; j < canvas.width; j += 50){
            ctx.fillStyle = "#000000ff";
            ctx.fillRect(j + 3, i + 3, 45, 45);
        }
    }
}


function update(){
    background();
    if(play){
        snake.update();
        apple.draw();
        apple.collition(snake);
        // Actualizacion del timer
        timeP += 1/60;
        let minutes = Math.floor(timeP / 60);
        let seconds = Math.floor(timeP % 60);
        let minutesText = minutes < 10 ? `0${minutes}` : minutes;
        let secondsText = seconds < 10 ? `0${seconds}` : seconds;
        timer.textContent = `${minutesText}:${secondsText}`;
    }
    requestAnimationFrame(update);
}
update();