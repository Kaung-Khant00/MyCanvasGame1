const canvas = document.querySelector("canvas")
const c = canvas.getContext("2d")
const scoreTag=document.querySelector(".topscore")
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
    setTimeout(()=>{gameoverFunction()},100)
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
    spawnEnemy()
    animation()
    score=0
    barrier.classList.add("prevent")
}
//calling enemy , making enemy
function spawnEnemy(){
    setInterval(()=>{
        let x,y
        if(Math.random()-0.5<0){
            x=Math.random()*innerWidth
            Math.random()-.5<0 ? y=0 : y=innerHeight
        }else{
            y=Math.random()*innerHeight
            Math.random()-.5<0 ? x=0 : x=innerWidth
        }
        const radian = Math.atan2(innerHeight/2-y,innerWidth/2-x)
        enemy.push(new Enemy(x,y,Math.random()*14+8,`hsl(${Math.random()*360},50%,50%)`,{
            x:Math.cos(radian)*1.1,y:Math.sin(radian)*1.1
        }))
    },1500)
    setInterval(()=>{
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
    },25000)
}
addEventListener("click",()=>{
    score-=1
    let radian=Math.atan2(mouse.x-innerWidth/2,mouse.y-innerHeight/2)-Math.PI/2
    projectiles.push(new Projectile(innerWidth/2,innerHeight/2,5,"white",{
        x:Math.cos(radian)*5,y:Math.sin(-radian)*5
    }))
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
            cancelAnimationFrame(keyForCancel)
            gameoverContainer.style.display="flex"
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
setTimeout(()=>{
    spawnEnemy()
    animation()
},50)