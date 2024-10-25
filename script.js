const canvas = document.querySelector("canvas")
const c = canvas.getContext("2d")
canvas.width = innerWidth
canvas.height = innerHeight
const scoreTag = document.querySelector(".score")
const loseContainer = document.querySelector(".lose_container")
const restartButton = document.querySelector(".restart_button")
const endScoreTag = document.querySelector(".endScore")
const startContainer = document.querySelector(".start-container")
const canvasContainer = document.querySelector(".canvas_container")
const bestScore = document.querySelector(".best_score")

/*  mouse move event and cursor location  */
let mouse = { x : null ,  y  : null }
addEventListener("mousemove",(event) => {
    mouse.x = event.clientX
    mouse.y = event.clientY
})
/*  restarting the game function */
function restartGame(){
    setTimeout(()=>{addEventListener("click",projectileMaker)},10)
    projectiles=[]
    enemys=[]
    particles=[]
    score=0
    loseContainer.style.display="none"
    animation()
    noramlEnemy = setInterval(()=>{enemyMaker("normal")},3000)
    goldEnemy = setInterval(()=>{enemyMaker("gold")},10000)
}
/*  classes  */
class Player {
    constructor(x,y,radius,color) {
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
class Projectile extends Player{
    constructor(x,y,radius,color,velocity) {
        super(x,y,radius,color)
        this.velocity = velocity
    }
    update(){
        this.x += this.velocity.x
        this.y += this.velocity.y
        this.draw()
    }
}
class Enemy extends Projectile{
    draw(){
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
        c.fillStyle=this.color
        c.fill()
        if(this.color=="gold"){
        c.lineWidth=5
        c.strokeStyle="white"
        c.stroke()
        }
    }
}
const friction = 0.99
class Particle{
    constructor(x,y,radius,color,velocity) {
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
        this.velocity = velocity
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
        this.alpha -= 0.025
        this.x += this.velocity.x 
        this.y += this.velocity.y 
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.draw()
    }
}

    /*  gameover animation */
    let animatekey
    const animateParticle = () => {
        console.log("hello")
        animatekey = requestAnimationFrame(animateParticle)
        c.fillStyle="rgb(0,0,0,0.05)"
        c.fillRect(0,0,innerWidth,innerHeight)
        particles.forEach((item,index)=>{
            item.alpha<=.025 ? particles.splice(index,1) : item.update()
        })
    }
/*  classes value making and storing the moving object data */
let player = new Player(innerWidth/2,innerHeight/2,20,"white")
let [projectiles,enemys,particles]=[[],[],[]]
let score=0
/*  animation function  */
function animation(){
    const animatedKey = requestAnimationFrame(animation)
    c.fillStyle="rgb(0,0,0,0.1)"
    c.fillRect(0,0,innerWidth,innerHeight)
    player.draw()
    projectiles.forEach((pItem,pIndex)=>{
        pItem.update()
        /*  removeing the projectile that beyond the screen */
        if(pItem.x-pItem.radius<0||
            pItem.x+pItem.radius>innerWidth||
            pItem.y-pItem.radius<0||
            pItem.y+pItem.radius>innerHeight
        ){
            projectiles.splice(pIndex,1)
        }
        enemys.forEach((eItem,eIndex) => {
            /*  hit the enemy with projectile and remove it */
            const dis = Math.hypot(eItem.y-pItem.y , eItem.x-pItem.x)
            if(dis-eItem.radius-pItem.radius < .1){
                for (let i = 0; i < eItem.radius*2; i++) {
                    let radius = Math.random()*2+1
                    const radian = Math.random()*Math.PI*2
                    particles.push(new Particle(
                        eItem.x,eItem.y,radius,eItem.color,{
                            x : Math.cos(radian)*Math.random()*5,
                            y : Math.sin(radian)*Math.random()*5
                        }
                    ))
                }
                if(eItem.radius>15){
                    score+=5
                    eItem.color=="gold"? eItem.radius-=3 : eItem.radius-=4
                    projectiles.splice(pIndex,1)
                }else{
                    score+=10
                    enemys.splice(eIndex,1)
                    projectiles.splice(pIndex,1)
                }
            }
        })
    })
    enemys.forEach((enemyItem)=>{
        enemyItem.update()
        /*  stoping the game when lose  */
        const dis = Math.hypot(enemyItem.y-player.y , enemyItem.x-player.x)
        if(dis-player.radius-enemyItem.radius<-1){
            removeEventListener("mousedown",()=>{projectileMan(true)})
            removeEventListener("mouseup",()=>{projectileMan(false)})
            removeEventListener("click",projectileMaker)
            const best = parseInt(localStorage.getItem("key"))
            if(best<=score) localStorage.setItem("key",score)
            bestScore.innerHTML=localStorage.getItem("key")
            cancelAnimationFrame(animatedKey)
            endScoreTag.innerHTML=score
            setTimeout(()=>{loseContainer.style.display="flex"},1000)
            for (let i = 0; i < 50; i++) {
                let radius = Math.random()*2+1.5
                const radian = Math.random()*Math.PI*2
                particles.push(new Particle(
                    player.x,player.y,radius,player.color,{
                        x : Math.cos(radian)*Math.random()*9,
                        y : Math.sin(radian)*Math.random()*9
                    }
                ))
            }    
            clearInterval(noramlEnemy)
            clearInterval(goldEnemy)
            setTimeout(animateParticle,500)
            setTimeout(()=>{cancelAnimationFrame(animatekey)},1500)
    }})
    particles.forEach((item,index)=>{
        item.alpha<=.025 ? particles.splice(index,1) : item.update()
    })
/*  update the score to the UI */
scoreTag.innerHTML=score
}

/*  cresting the enemy  */
function enemyMaker(type){
    let x , y 
    if(Math.random() < .5){
        x = Math.random() < .5 ? 0 : innerWidth
        y = Math.random() * innerHeight
    }else{
        x = Math.random() * innerWidth
        y = Math.random() < .5 ? 0 : innerHeight
    }
    let radius = Math.random()*25+11
    if (type=="gold") radius+=10
    const color = type=="normal" ? `hsl(${Math.random()*360}deg,50%,50%)` : "gold"
    const radian = Math.atan2( innerHeight/2 - y , innerWidth/2 - x )
    enemys.push(
        new Enemy ( x , y , radius , color , {
            x : Math.cos(radian) ,
            y : Math.sin(radian)
        })
    )
}
/*  spawning the enemy here  */
let noramlEnemy,goldEnemy 

/* event related Functions  */
function projectileMaker(){
    score-=2
    const radian = Math.atan2( mouse.y - innerHeight/2 , mouse.x - innerWidth/2)
    projectiles.push(
        new Projectile (innerWidth/2,innerHeight/2,5,"white",{
            x : Math.cos(radian) *4,
            y : Math.sin(radian) *4
        })
    )
}
function projectileMan(check){ 
    if(check){
        shoot = setInterval(projectileMaker,100)
    }else{
        clearInterval(shoot)
    }
}

if(localStorage.getItem("key")==null){
    localStorage.setItem("key",0)
}
const projectileMantouch = (event) =>{
    mouse.x=event.changedTouches[0].screenX
    mouse.y=event.changedTouches[0].screeny
    projectileMaker()
}
function gameStart(){
    bestScore.innerHTML=localStorage.getItem("key")
    setTimeout(()=>{
        animation()
        noramlEnemy = setInterval(()=>{enemyMaker("normal")},3000)
        goldEnemy = setInterval(()=>{enemyMaker("gold")},10000)
    },700)
    startContainer.style.transform="scale(0.001)"
    setTimeout(()=>{
        startContainer.display="none"
        addEventListener("mousedown",()=>{projectileMan(true)})
        addEventListener("mouseup",()=>{projectileMan(false)})
        addEventListener("touchstart",projectileMantouch)
        addEventListener("touchend",projectileMantouch)
        addEventListener("click",projectileMaker)
    },1001)
}