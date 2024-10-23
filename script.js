const canvas = document.querySelector("canvas")
const c = canvas.getContext("2d")
const scoreTag=document.querySelector(".topscore")
const bestScoreTag=document.querySelector(".topbestscore")
const popupScore=document.querySelector(".gameover")
const restartButton=document.querySelector(".Restart")
const gameoverContainer=document.querySelector(".gameoverContainer")
canvas.width=innerWidth
canvas.height=innerHeight
//mouse event
let mouse={
    x:innerWidth/2,
    y:innerHeight/2
}
addEventListener("mousemove",(event)=>{
    mouse.x=event.x
    mouse.y=event.y
})

//Player runner
class Player{
    constructor(x,y,radius,color){
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
    }
    draw(){
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
        c.fillStyle=this.color
        c.fill()
    }
}
class Projectile{
    constructor(x,y,radius,color,velocity){
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
        this.velocity=velocity
        this.check=0
    }
    draw(){
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
        c.fillStyle=this.color
        c.fill()
    }
    update(){
        this.x+=this.velocity.x
        this.y+=this.velocity.y
        this.draw()
    }
}

//enemy array runner
class Enemy{
    constructor(x,y,radius,color,velocity){
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
        this.velocity=velocity
        this.check=0
    }
    draw(){
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
        c.fillStyle=this.color
        c.fill()
    }
    update(){
        this.x+=this.velocity.x
        this.y+=this.velocity.y
        this.draw()
    }
}
const fraction=0.99
class Particles{
    constructor(x,y,radius,color,velocity){
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
        this.velocity=velocity
        this.alpha=1
    }
    draw(){
        c.save()
        c.beginPath()
        c.globalAlpha=this.alpha
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
        c.fillStyle=this.color
        c.fill()
        c.restore()
    }
    update(){
        this.velocity.x*=fraction
        this.velocity.y*=fraction
        this.x+=this.velocity.x
        this.y+=this.velocity.y
        this.alpha-=0.01
        this.draw()
    }
}

//arrays
let player=new Player(innerWidth/2,innerHeight/2,20,"white")
let projectiles=[]
let enemy=[]
let particles=[]
player.draw()

//restart the game
restartButton.addEventListener("click",()=>{
    setTimeout(()=>{
        gameoverFunction()
        animation()
    },100)
})
const barrier=document.querySelector(".barrier")
const gameoverFunction=()=>{
    player=new Player(innerWidth/2,innerHeight/2,20,"white")
    projectiles=[]
    enemy=[]
    particles=[]
    gameoverContainer.classList.add("gameOverAnimation")
    setTimeout(()=>{
        gameoverContainer.style.display="none"
        gameoverContainer.classList.remove("gameOverAnimation")
    },500)
    score=0
    barrier.classList.add("prevent")
}
//calling enemy , making enemy
function spawnFun(){
        let x,y
        if(Math.random()-.5<0){
            x=Math.random()*innerWidth
            Math.random()-.5<0 ? y=0 : y=innerHeight
        }else{
            y=Math.random()*innerHeight
            Math.random()-.5<0 ? x=0 : x=innerWidth
        }
        const radian = Math.atan2(innerHeight/2-y,innerWidth/2-x)
        enemy.push(new Enemy(x,y,Math.random()*14+8,`hsl(${Math.random()*360},50%,50%)`,{
            x:Math.cos(radian)*.95,y:Math.sin(radian)*.95
        }))
}
const spawnGoldenFun=()=>{
    let x,y
    if(Math.random()-0.5<0){
        x=Math.random()*innerWidth
        Math.random()-.5<0 ? y=0 : y=innerHeight
    }else{
        y=Math.random()*innerHeight
        Math.random()-.5<0 ? x=0 : x=innerWidth
    }
    const radian = Math.atan2(innerHeight/2-y,innerWidth/2-x)
    enemy.push(new Enemy(x,y,Math.random()*40+8,"gold",{
        x:Math.cos(radian)*0.8,y:Math.sin(radian)*0.8
    }))
}
function spawnEnemy(){
    setInterval(spawnFun,900)
    setInterval(spawnGoldenFun,25000)
}
function shooting(){
    score-=1
    let radian=Math.atan2(mouse.x-innerWidth/2,mouse.y-innerHeight/2)-Math.PI/2
    projectiles.push(new Projectile(innerWidth/2,innerHeight/2,5,"white",{
        x:Math.cos(radian)*5,y:Math.sin(-radian)*5
    }))
}
let start
function caller(check){
    if(check){
        start=setInterval(shooting,100)
    }else{
        clearInterval(start)
    }
}
addEventListener("mousedown",()=>{
    caller(true)
})
addEventListener("mouseup",()=>{
    caller(false)
})
addEventListener("touchstart",()=>{
    caller(true)
})
addEventListener("touchend",()=>{
    caller(false)
})
//animation
let keyForCancel,score=0
function animation(){
    keyForCancel=requestAnimationFrame(animation)
    c.fillStyle="rgba(0,0,0,0.1)"
    c.fillRect(0,0,innerWidth,innerHeight)
    projectiles.forEach((element,i)=>{
        if(element.x-element.radius<0
            ||element.x-element.radius>innerWidth
            ||element.y-element.radius<0
            ||element.y-element.radius>innerHeight){
            return projectiles.splice(i,1)
        }
            element.update()
    })
    enemy.forEach(element => {
        element.update()
    });
    player.draw()
    particles.forEach((element,particleindex)=>{
        if(element.alpha<=0.02){
            particles.splice(particleindex,1)
        }else{
            element.update()
        }
    })
    enemy.forEach((enemys,enemyindex)=>{
        const enemyDistance = Math.hypot(enemys.x-innerWidth/2,enemys.y-innerHeight/2)
        if(enemyDistance-enemys.radius-player.radius<=0){
            const currentBest = parseInt(localStorage.getItem("key"))
            const gameEndScore = parseInt(scoreTag.innerHTML)
            clearInterval(spawnFun,900)
            clearInterval(spawnGoldenFun,25000)
            cancelAnimationFrame(keyForCancel)
            gameoverContainer.style.display="flex"
            if(gameEndScore>currentBest){
                bestScoreTag.innerHTML=gameEndScore
                localStorage.setItem("key",gameEndScore)
            }
        }
        projectiles.forEach((projectile,projectileIndex)=>{
            const distance = Math.hypot(enemys.x-projectile.x,enemys.y-projectile.y)
            if(distance-enemys.radius-projectile.radius<1){
                let radius=enemys.radius
                if(enemys.color==="gold"){
                    radius=enemys.radius*2
                }
                for (let i = 0; i < radius; i++) {
                    particles.push(new Particles(enemys.x,enemys.y,Math.random()*2+0.5,enemys.color,{
                        x:Math.cos(Math.random()*Math.PI*2),
                        y:Math.sin(Math.random()*Math.PI*2)
                    }))
                }
                projectiles.splice(projectileIndex,1)
                if(enemys.radius<12){
                    enemy.splice(enemyindex,1)
                    if(enemys.color==="gold"){
                        score+=5
                    }
                    score+=3
                }else{
                    enemys.radius-=3
                    if(enemys.color==="gold"){
                        enemys.radius+=1
                        score+=5
                    }
                    score+=4
                }
            }
        })
    })
    scoreTag.innerHTML=score
    popupScore.innerHTML=score
}
//function calling place
const startContainer=document.querySelector(".start-container")
let startGame=false
function gameStart(){
    if(startGame) return 
    startContainer.style.transform = "scale(0.01)"
    startContainer.style.opacity = "0"
    setTimeout(()=>{
    startContainer.style.display = "none"
    startContainer.style.zIndex = "-1"
    },900)
    startGame=true
    canvas.style.display="inherit"
    setTimeout(()=>{
        spawnEnemy()
        animation()
    },50)
}
/*  loacal Storage  */
if(localStorage.getItem("key")==null) {
    localStorage.setItem("key",0)
}else{
    bestScoreTag.innerHTML= parseInt(localStorage.getItem("key"))
}