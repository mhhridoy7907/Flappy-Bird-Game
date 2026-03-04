const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");

// Full screen canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Bird object
let bird={
    x:150,
    y:canvas.height/2,
    width:100,
    height:100,
    gravity:0.6,
    lift:-12,
    velocity:0
};

// Pipes array
let pipes=[];
let frame=0;
let score=0;
let gameRunning=true;

// Sky layers
const layerA=document.getElementById("layerA");
const layerB=document.getElementById("layerB");
let layerX={A:0,B:0};
let layerSpeed={A:0.3,B:0.6};

function updateLayers(){
    layerX.A-=layerSpeed.A;
    layerX.B-=layerSpeed.B;

    layerA.style.backgroundPositionX = layerX.A + "px";
    layerB.style.backgroundPositionX = layerX.B + "px";
}

// Falling Star particles
const stars=[];
const starCount = 200;
for(let i=0;i<starCount;i++){
    stars.push({
        x: Math.random()*canvas.width,
        y: Math.random()*canvas.height*0.7, // 70% of page height
        radius: Math.random()*1.5 + 0.5,
        speed: Math.random()*1+0.2,
        alpha: Math.random()*0.8+0.2
    });
}

function drawStars(){
    ctx.save();
    ctx.fillStyle = "white";
    ctx.shadowColor = "white";
    ctx.shadowBlur = 2;
    for(let s of stars){
        ctx.globalAlpha = s.alpha;
        ctx.beginPath();
        ctx.arc(s.x,s.y,s.radius,0,Math.PI*2);
        ctx.fill();
        // Move star downward
        s.y += s.speed;
        // fade out after 70% height
        if(s.y > canvas.height*0.7){
            s.alpha -= 0.01;
        }
        // Reset star
        if(s.alpha <= 0){
            s.x = Math.random()*canvas.width;
            s.y = Math.random()*canvas.height*0.7;
            s.radius = Math.random()*1.5 + 0.5;
            s.speed = Math.random()*1+0.2;
            s.alpha = Math.random()*0.8+0.2;
        }
    }
    ctx.restore();
}

// Draw Pipe with lighting style
function drawPipe(pipe){
    const pipeWidth = pipe.width;
    const pipeHeightTop = pipe.top;
    const pipeHeightBottom = canvas.height - pipe.bottom;

    let gradientTop = ctx.createLinearGradient(pipe.x,0,pipe.x+pipeWidth,pipeHeightTop);
    gradientTop.addColorStop(0,"#0f9d58");
    gradientTop.addColorStop(1,"#34a853");

    let gradientBottom = ctx.createLinearGradient(pipe.x,pipe.bottom,pipe.x+pipeWidth,canvas.height);
    gradientBottom.addColorStop(0,"#0f9d58");
    gradientBottom.addColorStop(1,"#34a853");

    ctx.fillStyle = gradientTop;
    ctx.fillRect(pipe.x,0,pipeWidth,pipeHeightTop);

    ctx.fillStyle = gradientBottom;
    ctx.fillRect(pipe.x,pipe.bottom,pipeWidth,pipeHeightBottom);

    // Lighting/highlight
    ctx.fillStyle="rgba(255,255,255,0.25)";
    ctx.fillRect(pipe.x,0,pipeWidth/3,pipeHeightTop);
    ctx.fillRect(pipe.x,pipe.bottom,pipeWidth/3,pipeHeightBottom);

    // Shadow effect
    ctx.fillStyle="rgba(0,0,0,0.25)";
    ctx.fillRect(pipe.x+pipeWidth-15,0,15,pipeHeightTop);
    ctx.fillRect(pipe.x+pipeWidth-15,pipe.bottom,15,pipeHeightBottom);
}

// Update Game
function update(){
    if(!gameRunning) return;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Draw stars
    drawStars();

    // Update sky layers
    updateLayers();

    // Bird physics
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    
    const birdImg=document.getElementById("birdImg");
    birdImg.style.left = (bird.x - bird.width/2) + "px";
    birdImg.style.top = (bird.y - bird.height/2) + "px";
    birdImg.style.transform = `rotate(${bird.velocity*2}deg)`;

  
    if(frame % 100 === 0){
        let top = Math.random()*(canvas.height/2)+50;
        let gap = 200;
        pipes.push({
            x:canvas.width,
            width:100,
            top:top,
            bottom:top+gap
        });
    }

  
    for(let i=0;i<pipes.length;i++){
        pipes[i].x -= 4;
        drawPipe(pipes[i]);

        if(bird.x+bird.width/2>pipes[i].x &&
           bird.x-bird.width/2<pipes[i].x+pipes[i].width &&
           (bird.y-bird.height/2< pipes[i].top ||
            bird.y+bird.height/2>pipes[i].bottom)
        ){ endGame(); }

        if(pipes[i].x + pipes[i].width <0){
            pipes.splice(i,1);
            score++;
            document.getElementById("score").innerText=score;
        }
    }

    if(bird.y+bird.height/2>canvas.height || bird.y-bird.height/2<0){
        endGame();
    }

    frame++;
    requestAnimationFrame(update);
}


function endGame(){
    gameRunning=false;
    document.getElementById("gameOver").style.display="block";
}


function restart(){
    bird.y = canvas.height/2;
    bird.velocity = 0;
    pipes=[];
    score=0;
    frame=0;
    gameRunning=true;
    document.getElementById("score").innerText=0;
    document.getElementById("gameOver").style.display="none";
    update();
}


document.addEventListener("keydown",function(e){
    if(e.code==="Space") bird.velocity=bird.lift;
});
document.addEventListener("click",function(){ bird.velocity=bird.lift; });


window.addEventListener("resize",()=>{ 
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
    bird.x=150;
    bird.y=canvas.height/2;
});

update();
