window.addEventListener('load', function(){ //jatketaan vasta, kun kaikki on ladattu
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 800;

    const canvas2 = document.getElementById('canvas2');
    const ctx2 = canvas2.getContext('2d');
    canvas2.width = 800;
    canvas2.height = 800;
    
    const MAXFRAMERATEMS=20;
    let lastTime=0;

    // canvas settings
    ctx.fillStyle = 'black';
    ctx2.fillStyle = 'red';

    //https://www.youtube.com/watch?v=7JtLHJbm0kA&list=PLYElE_rzEw_uryBrrzu2E626MY4zoXvx2&index=9
    class InputHandler{
        constructor(){
            this.keys = [];
            //console.log("fdsafdsa",this.keys);
            window.addEventListener('keydown', e => {
                //console.log("keydown", e); 
                if ((    e.key === 'ArrowUp'||
                        e.key === 'ArrowDown'||
                        e.key === 'ArrowLeft'||
                        e.key === 'ArrowRight'  )
                        && this.keys.indexOf(e.key) === -1){      
                    this.keys.push(e.key);               
                }
            });
            window.addEventListener('keyup', e => {
                if ((   e.key === 'ArrowUp' ||
                        e.key === 'ArrowDown'||
                        e.key === 'ArrowLeft'||
                        e.key === 'ArrowRight'  )
                        //&& this.keys.indexOf(e.key) === 1){
                    ){
                    this.keys.splice(this.keys.indexOf(e.key),1);
                }
                console.log(this.keys.length);
            });
            
        }
    }


    class nelio{
        constructor(){
            this.x = 10;
            this.y = 10;
            this.width = 100;
            this.height = 100;
            this.lastTimeStamp=0;
            this.speed=0.1;
            this.xdir=1;
            this.ydir=1;
            this.rotate=0;
            this.image = document.getElementById('playerImage');
            this.points = [];
            this.centerpoint_x = 50;
            this.centerpoint_y = 50;
            this.reunapisteetOrig = [{x: -50, y: -50}, {x: 50, y: -50}, {x: -50, y: 50}, {x: 50, y: 50}];
            this.reunapisteet = [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}];
            this.uusix = 10;
            this.uusiy = 10;
            
        }

        update(deltatime, input){
            let deltaspeed = this.speed * deltatime *0.3;

            //ohjataan
            if (input.keys.indexOf('ArrowUp') > -1)
            {
                //ylöspäin näppäimellä liikutaan menosuuntaan
                this.x = this.x + 5 * Math.sin(this.rotate * Math.PI / 180)
                this.y = this.y - 5 * Math.cos(this.rotate * Math.PI / 180)
                //this.y += deltaspeed * 5* this.rotate*Math.PI/180;
                //console.log("ylospain",input.keys.indexOf('ArrowUp'));
            }
            if (input.keys.indexOf('ArrowDown') > -1)
            {
                this.y = this.y +5;
            }
            if (input.keys.indexOf('ArrowLeft') > -1)
            {
                //käännytään vastapäivään
                this.rotate-=3;
                if (this.rotate < 0) this.rotate = 360;
            }
            if (input.keys.indexOf('ArrowRight') > -1)
            {
                //käännytään myötäpäivään
                this.rotate+=3;
                if (this.rotate > 360) this.rotate = 0;
            }

            //maan vetovoima
            this.y += deltaspeed * 1;

            //maksimirajat
            if (this.x<-1) {
                this.x = -1;
            }
            if (this.y<-1) {
                console.log("jeee");
                this.y = -1;
            }
            if (this.x + this.height > canvas.height +1) {
                this.x = canvas.height - this.height +1;
            }
            if (this.y + this.width>canvas.width + 1) {
                this.y = canvas.width - this.width +1;
            }   

            this.centerpoint_x = this.x+this.width/2;
            this.centerpoint_y = this.y+this.height/2;
            var radians = (Math.PI / 180) * this.rotate;
            var kulma1x=-50; //kulman etäisyys keskipisteestä
            var kulma1y=-50;  //kulman etäisyys keskipisteestä
            this.uusix = kulma1x*Math.cos(radians) - kulma1y*Math.sin(radians) + this.centerpoint_x;
            this.uusiy = kulma1y*Math.cos(radians) + kulma1x*Math.sin(radians) + this.centerpoint_y; 

            if (this.uusix<-1) {
                this.x = this.centerpoint_x - this.uusix -49;
            }
            if (this.uusiy<-1) {
                this.y = this.centerpoint_y - this.uusiy -49;
            }
 
            for (let i = 0; i < this.reunapisteet.length; i++) {
                this.reunapisteet[i].x = this.reunapisteetOrig[i].x*Math.cos(radians) - this.reunapisteetOrig[i].y*Math.sin(radians) + this.centerpoint_x;
                this.reunapisteet[i].y = this.reunapisteetOrig[i].y*Math.cos(radians) + this.reunapisteetOrig[i].x*Math.sin(radians) + this.centerpoint_y; 
            }

            for (let i = 0; i < this.reunapisteet.length; i++) {
                if (this.reunapisteet[i].x <-1) {
                    this.x = this.centerpoint_x - this.reunapisteet[i].x -49;
                }
                if (this.reunapisteet[i].y<-1) {
                    this.y = this.centerpoint_y - this.reunapisteet[i].y -49;
                }
                if (this.reunapisteet[i].x > canvas.width +1) {
                    this.x = canvas.width - (this.reunapisteet[i].x -this.centerpoint_x) -51;
                }
                if (this.reunapisteet[i].y > canvas.height +1) {
                    this.y = canvas.height - (this.reunapisteet[i].y -this.centerpoint_y) -51;
                }
            }
        }
                
        draw(){
            //this.drawRotateTranslate();
            this.drawRotateTranslate2();
        }

   
        drawRotateTranslate2(){
            //piirretään musta neliö
            ctx.fillRect(this.x,this.y,this.width,this.height);

            //koska muokataan canvasta, niin savetetaan parametrit ja palautetaan myöhemmin
            ctx.save();
            ctx2.save();
          

            //piirretään kuvaa. Rotate kääntää koko canvasia, joten ensin pitää siirtää canvas              
            ctx2.translate(this.x + this.width/2,this.y+this.height/2);
            ctx2.rotate( this.rotate*Math.PI/180 );
            ctx2.translate(-this.width/2,-this.height/2);

            //piirretään canvas2 borderit huvinvuoksi
            ctx2.beginPath();
            ctx2.rect(0, 0, canvas2.width, canvas2.height);
            ctx2.stroke();

            ctx2.drawImage(this.image, 0 , 0, this.width, this.height);
            //console.log(this.image);


            //selvitetään todellinen piste käännetystä kulmasta
            // Selvitä transformaatiomatriisi
            var transformMatrix = ctx2.getTransform();

           // Lasketaan pisteen sijainti käännetyllä kuvalla
            var point = {x: this.width, y: this.height}; // Piste jonka sijainti halutaan selvittää
            var transformedPoint = transformMatrix.transformPoint(point);

            // transformedPoint sisältää nyt pisteen sijainnin käännetyllä kuvalla
            //console.log(transformedPoint.x, transformedPoint.y);
            this.points[0] = transformMatrix.transformPoint({x: 0, y: 0});
            this.points[1] = transformMatrix.transformPoint({x: 0, y: this.height});
            this.points[2] = transformMatrix.transformPoint({x: this.width, y: 0});
            this.points[3] = transformMatrix.transformPoint({x: this.width, y: this.height});
            console.log(this.points, this.rotate);

            ctx.fillRect(this.points[0].x, this.points[0].y,4,4); // fill in the pixel at (10,10)
            ctx.fillRect(this.points[1].x, this.points[1].y,4,4);
            ctx.fillRect(this.points[2].x, this.points[2].y,4,4);
            ctx.fillRect(this.points[3].x, this.points[3].y,4,4);
            ctx.fillStyle = "red";
            ctx.fillRect(this.centerpoint_x, this.centerpoint_y,4,4);
            ctx.fillRect(this.uusix, this.uusiy,10,10);


            for (let i = 0; i < this.reunapisteet.length; i++) {
                ctx.fillRect(this.reunapisteet[i].x, this.reunapisteet[i].y,10,10); 
            }
            //ja lopuksi palauttaa canvas
            //ctx.rotate(-Math.PI / 4);
            //ctx.translate(-this.x - this.width/2, -this.y);

            //palautetaan canvas arvot
            ctx.restore();
            ctx2.restore();
        }




        //TÄLLÄ ON SAATU KÄÄNNETTYÄ IMAGE, MUTTA EI TIEDETÄ NURKKAPISTEITÄ KOORDINAATISTOSSA
        drawRotateTranslate(){
            //piirretään musta neliö
            ctx.fillRect(this.x+5,this.y,this.width,this.height);

            //koska muokataan canvasta, niin savetetaan parametrit ja palautetaan myöhemmin
            ctx.save();

            //piirretään neliölle vihreä osoitin keskelle ylös
            ctx.fillStyle = "green";
            ctx.fillRect(this.x+this.width*0.5-this.width*0.1,this.y,this.width*0.2,this.height*0.3);
            

            //piirretään kuvaa. Rotate kääntää koko canvasia, joten ensin pitää siirtää canvas          
            ctx.translate(this.x + this.width/2, this.y);
            ctx.rotate(Math.PI / 4);

            let rotateAngle = 90;
            //this.image.setAttribute("style", "transform: rotate(" + rotateAngle + "deg)");
            ctx.drawImage(this.image, 0 , 0, this.width, this.height);
            //console.log(this.image);

            //ja lopuksi palauttaa canvas
            //ctx.rotate(-Math.PI / 4);
            //ctx.translate(-this.x - this.width/2, -this.y);

            //palautetaan canvas arvot
            ctx.restore();
        }

    }

    const nelio1 = new nelio();
    const input = new InputHandler();

    //window.addEventListener('keydown', function(e){;
            //console.log(e);
    //});

    var imageRed = document.getElementById('playerImageRed');
    //imageRed.setAttribute("style", "transform: rotate(180)");
    imageRed.style.transform = "rotate(165deg)";
    imageRed.style.left = "300px"

    function animate(timeStamp){
    
        //lasketaan delttatime. Käytetään hyväksi ruutupäivityksissä
        let deltatime = timeStamp - lastTime;

        if (timeStamp-lastTime>10) //framerate testit
        {   
            lastTime=timeStamp;
            nelio1.update(deltatime, input); 
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
            nelio1.draw();
        }
        //console.log(!(nelio1.x > canvas.width));
        if (!(nelio1.x > canvas.width))
        {
            console.log(!(nelio1.x > canvas.width));
            requestAnimationFrame(animate);
        }
    }
    animate(0);
});