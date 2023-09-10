window.addEventListener('load', function(){ //jatketaan vasta, kun kaikki on ladattu
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1800;
    canvas.height = 1200;

    const canvas2 = document.getElementById('canvas2');
    const ctx2 = canvas2.getContext('2d');
    canvas2.width = 1800;
    canvas2.height = 1200;
    
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
               // console.log(this.keys.length);
            });
            
        }
    }


    class ajoneuvo{
        constructor(){
            this.x = 10;
            this.y = 10;
            this.width = 100;
            this.height = 100;
            this.lastTimeStamp=0;
            this.speed=0.5;
            this.xdir=1;
            this.ydir=1;
            this.rotate=0;
            this.image = document.getElementById('playerImage');
            this.points = [];
            this.centerpoint_x = 50;
            this.centerpoint_y = 50;
            this.reunapisteetOrig = [{x: -50, y: -50}, {x: 0, y: -75}, {x: 50, y: -50}, {x: 50, y: 50}, {x: -50, y: 50}];
            this.reunapisteet = [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}];
            this.reunapisteetLast = [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}];
        }

        update(deltatime, input){
            let deltaspeed = this.speed * deltatime *0.3;
            //this.reunapisteetLast =this.reunapisteet;
            this.reunapisteetLast[1].x = this.reunapisteet[1].x;
            let reunaxlast = this.reunapisteet[1].x;
            let reunapistePixelColors = [];
            //ohjataan
            if (input.keys.indexOf('ArrowUp') > -1)
            {

                this.centerpoint_x = this.centerpoint_x + 5 * deltaspeed * Math.sin(this.rotate * Math.PI / 180);
                this.centerpoint_y = this.centerpoint_y - 5 * deltaspeed * Math.cos(this.rotate * Math.PI / 180);
                //this.y += deltaspeed * 5* this.rotate*Math.PI/180;
                //console.log("ylospain",input.keys.indexOf('ArrowUp'));
            }
            if (input.keys.indexOf('ArrowDown') > -1)
            {
                this.centerpoint_x = this.centerpoint_x + 5 * -deltaspeed * Math.sin(this.rotate * Math.PI / 180);
                this.centerpoint_y = this.centerpoint_y - 5 * -deltaspeed * Math.cos(this.rotate * Math.PI / 180);
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
            //this.centerpoint_y += deltaspeed * 1;

            //lasketaan reunapisteet käännöksen jälkeen
            var radians = (Math.PI / 180) * this.rotate;
            for (let i = 0; i < this.reunapisteet.length; i++) {
                
                this.reunapisteet[i].x = this.reunapisteetOrig[i].x*Math.cos(radians) - this.reunapisteetOrig[i].y*Math.sin(radians) + this.centerpoint_x;
                this.reunapisteet[i].y = this.reunapisteetOrig[i].y*Math.cos(radians) + this.reunapisteetOrig[i].x*Math.sin(radians) + this.centerpoint_y; 
            }
            //console.log(reunaxlast, this.reunapisteetLast[1].x, this.reunapisteet[1].x);
            //luetaan pixelin väri
            let pixel = ctx2.getImageData(this.reunapisteet[1].x, this.reunapisteet[1].y, 1, 1);

/*
            //haetaan piste, missä ei ole seinää canvas2 taustavärin perusteella
            //tämä edellisen pisteen mukaan. Vähän huono, kun edellinen piste voi jäädä kappaleen sisään.
            if (pixel.data[0] != 0){
                console.log(this.reunapisteetLast[1].x, this.reunapisteet[1].x);
                //lasketaan etäisyys edellisen päivityskerran pisteeseen
                let distancex = this.reunapisteetLast[1].x - this.reunapisteet[1].x;
                let distancey = this.reunapisteetLast[1].y - this.reunapisteet[1].y;
                console.log(distancex, distancey);

                //mahtaa olla turha hakea toiseen kertaan
                pixel = ctx2.getImageData(this.reunapisteet[1].x, this.reunapisteet[1].y, 1, 1);
                //  console.log(pixel, pixel.data);


                //let pixeldata = getPixel(imgData1, 215, 215);
                console.log("pixeldata:",pixeldata);

                //lasketaan keskipisteen uusi piste. 
                //Käydään läpi edellisen pisteen kaikki välit ja lasketaan kuinka paljon pitää liikkua poispäin seinästä
                for(let i=0; i<11; i++){

                    var tarkkailtavaetaisyysx = distancex * 0.1 * i;
                    var tarkkailtavaetaisyysy = distancey * 0.1 * i;
                    var checkX = this.reunapisteet[1].x + tarkkailtavaetaisyysx;
                    var checkY = this.reunapisteet[1].y + tarkkailtavaetaisyysy;
                    
                    //var tarkkailtavapiste = 

                    pixel = ctx2.getImageData(checkX, checkY, 1, 1);
                    console.log(i, checkX, checkY,distancex,distancey, tarkkailtavaetaisyysx, pixel.data[0]);

                    if (pixel.data[0] != 255){
                        tarkkailtavaetaisyysx = tarkkailtavaetaisyysx * 2;
                        if (tarkkailtavaetaisyysx < 0){
                            tarkkailtavaetaisyysx = tarkkailtavaetaisyysx - 5;
                        } else{
                            tarkkailtavaetaisyysx = tarkkailtavaetaisyysx + 5;
                        }


                        this.centerpoint_x = this.centerpoint_x + tarkkailtavaetaisyysx;
                        break;
                    }

                }
                
            }
*/
/*
            //haetaan piste, missä ei ole seinää canvas2 taustavärin perusteella
            //Kokeillaan keskipisteen mukaan hakea uusi piste
            //tämä on smoothi
            if (pixel.data[0] != 0){
                console.log(this.centerpoint_x, this.reunapisteet[1].x);
                //lasketaan etäisyys edellisen päivityskerran pisteeseen
                let distancex = this.centerpoint_x - this.reunapisteet[1].x;
                let distancey = this.centerpoint_x - this.reunapisteet[1].y;
                console.log(distancex, distancey);

                //mahtaa olla turha hakea toiseen kertaan
                pixel = ctx2.getImageData(this.reunapisteet[1].x, this.reunapisteet[1].y, 1, 1);
                //  console.log(pixel, pixel.data);


                //let pixeldata = getPixel(imgData1, 215, 215);
                console.log("pixeldata:",pixeldata);

                //Käydään läpi keskipisteen ja seinään osuvan pisteen kaikki välit ja 
                //lasketaan kuinka paljon pitää liikkua poispäin seinästä
                for(let i=0; i<100; i++){

                    var tarkkailtavaetaisyysx = distancex * 0.01 * i;
                    var tarkkailtavaetaisyysy = distancey * 0.01 * i;
                    var checkX = this.reunapisteet[1].x + tarkkailtavaetaisyysx;
                    var checkY = this.reunapisteet[1].y + tarkkailtavaetaisyysy;
                    
                    //haetaan taustapixelin uusi väri
                    pixel = ctx2.getImageData(checkX, checkY, 1, 1);
                    console.log(i, checkX, checkY,distancex,distancey, tarkkailtavaetaisyysx, pixel.data[0]);

                    if (pixel.data[0] != 255){
                        this.centerpoint_x = this.centerpoint_x + tarkkailtavaetaisyysx;
                        break;
                    }

                }
                
            }
*/
            
            //haetaan reunapisteiden avulla, missä ei ole seinää canvas2 taustavärin perusteella
            //Jos piste osuu seinään, niin siirretään centerpointtia osumakohdasta keskipisteeseen päin.
            // SAMA KUIN EDELLINEN, mutta kaikilla reunapisteillä
            // MUUTEN HYVÄ, mutta voi peruuttaa pisteiden välistä seinän sisään

            //haetaan kaikkien reunapisteiden väri canvas2:sta
            for (let i = 0; i < this.reunapisteet.length; i++) {
                reunapistePixelColors[i] = ctx2.getImageData(this.reunapisteet[i].x, this.reunapisteet[i].y, 1, 1);              
            }

            //käydään kaikki reunapisteet läpi
            for (let i = 0; i < reunapistePixelColors.length; i++) {
                if (reunapistePixelColors[i].data[0] != 0){

                    //lasketaan reunapisteen etäisyys keskipisteeseen
                    let distancex = this.centerpoint_x - this.reunapisteet[i].x;
                    let distancey = this.centerpoint_y - this.reunapisteet[i].y;
                    //console.log(i, distancex, distancey);

                    //Käydään läpi keskipisteen ja seinään osuvan pisteen kaikki välit ja 
                    //lasketaan kuinka paljon pitää liikkua poispäin seinästä
                    for(let j=0; j<100; j++){

                        var tarkkailtavaetaisyysx = distancex * 0.01 * j;
                        var tarkkailtavaetaisyysy = distancey * 0.01 * j;
                        var checkX = this.reunapisteet[i].x + tarkkailtavaetaisyysx;
                        var checkY = this.reunapisteet[i].y + tarkkailtavaetaisyysy;
                        
                        //haetaan taustapixelin uusi väri
                        reunapistePixelColors[i] = ctx2.getImageData(checkX, checkY, 1, 1);

                        //console.log(i, j, checkX, checkY,distancex,distancey,'(', tarkkailtavaetaisyysx, tarkkailtavaetaisyysy,')', reunapistePixelColors[i].data[0]);

                        //jos tässä kohdassa ei ole seinään, niin siirretään sen verran keskipistettä
                        if (reunapistePixelColors[i].data[0] != 255){
                            this.centerpoint_x = this.centerpoint_x + tarkkailtavaetaisyysx;
                            this.centerpoint_y = this.centerpoint_y + tarkkailtavaetaisyysy;
                                        //haetaan kaikkien reunapisteiden väri canvas2:sta
                            break;
                        }

                    }
                    
                }
            }


             //maksimirajat ulkoseiniin
             for (let i = 0; i < this.reunapisteet.length; i++) {
                if (this.reunapisteet[i].x <-1) {
                    this.centerpoint_x = this.centerpoint_x - this.reunapisteet[i].x;
                }
                if (this.reunapisteet[i].y<-1) {
                    this.centerpoint_y = this.centerpoint_y - this.reunapisteet[i].y;
                }
                if (this.reunapisteet[i].x > canvas.width +1) {
                    this.centerpoint_x  = canvas.width - (this.reunapisteet[i].x -this.centerpoint_x);
                }
                if (this.reunapisteet[i].y > canvas.height +1) {
                    this.centerpoint_y = canvas.height - (this.reunapisteet[i].y -this.centerpoint_y);
                }
            }   
            //päivitetään reunapisteet vielä piirtoa varten, jos mennyt maksimirajojen yli
            for (let i = 0; i < this.reunapisteet.length; i++) {
                this.reunapisteet[i].x = this.reunapisteetOrig[i].x*Math.cos(radians) - this.reunapisteetOrig[i].y*Math.sin(radians) + this.centerpoint_x;
                this.reunapisteet[i].y = this.reunapisteetOrig[i].y*Math.cos(radians) + this.reunapisteetOrig[i].x*Math.sin(radians) + this.centerpoint_y; 
            }

        }
                
        draw(){
            this.drawRotateTranslate();
        }
   
        drawRotateTranslate(){

            //koska muokataan canvasta, niin savetetaan parametrit ja palautetaan myöhemmin
            ctx.save();
            ctx2.save();
          
/*
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
*/

            //ctx2.fillRect(210, 210,50,500);

            for (let i = 0; i < this.reunapisteet.length; i++) {
                ctx.fillRect(this.reunapisteet[i].x-5, this.reunapisteet[i].y-5,10,10); 
            }

            //piirretään neliö pisteistä
            ctx.beginPath();
            
            ctx.moveTo(this.reunapisteet[0].x, this.reunapisteet[0].y);
            for (let i = 1; i < this.reunapisteet.length; i++) {
                ctx.lineTo(this.reunapisteet[i].x, this.reunapisteet[i].y);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.fillStyle = "yellow";
            ctx.fill();


            //palautetaan canvas arvot
            ctx.restore();
            ctx2.restore();
        }

    }

    class raketti{
        constructor(){
            this.x = 10;
            this.y = 10;
            this.width = 100;
            this.height = 100;
            this.lastTimeStamp=0;
            this.speed=0.5;
            this.speedY=0;
            this.speedX=0;
            this.kaasuPaalla=0;
            this.xdir=1;
            this.ydir=1;
            this.rotate=0;
            this.image = document.getElementById('playerImage');
            this.points = [];
            this.centerpoint_x = 50;
            this.centerpoint_y = 50;
            this.reunapisteetOrig = [{x: -50, y: -50}, {x: 0, y: -75}, {x: 50, y: -50}, {x: 50, y: 50}, {x: -50, y: 50}];
            this.reunapisteet = [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}];
            this.reunapisteetLast = [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}];
        }

        update(deltatime, input){
            let kimmoisuus = -0.3;
            let deltaspeed = this.speed * deltatime *0.3;
            let rotateSpeed = deltatime *0.1;
            let moottorinTeho = 4;
            let speedX = 0;
            let gravitaatio = 9;
            let ilmanvastus = 0.5;
            //this.reunapisteetLast =this.reunapisteet;
            this.reunapisteetLast[1].x = this.reunapisteet[1].x;
            let reunaxlast = this.reunapisteet[1].x;
            let reunapistePixelColors = [];
            //ohjataan
            if (input.keys.indexOf('ArrowUp') > -1)
            {
                this.speedX = this.speedX + gravitaatio*(deltatime/1000) * Math.sin(this.rotate * Math.PI / 180) * moottorinTeho;
                this.speedY = this.speedY + gravitaatio*(deltatime/1000) * Math.cos(this.rotate * Math.PI / 180) * moottorinTeho;
                this.kaasuPaalla = 1;
                //console.log("ylospain",input.keys.indexOf('ArrowUp'));
            }else
            {
                this.speedY = this.speedY - gravitaatio*(deltatime/1000);
                this.speedX = this.speedX - (deltatime/1000) * this.speedX * ilmanvastus;
                this.kaasuPaalla = 0;
            }
            
            if (input.keys.indexOf('ArrowDown') > -1)
            {
                this.centerpoint_x = this.centerpoint_x + 5 * -deltaspeed * Math.sin(this.rotate * Math.PI / 180);
                this.centerpoint_y = this.centerpoint_y - 5 * -deltaspeed * Math.cos(this.rotate * Math.PI / 180);
            }
            if (input.keys.indexOf('ArrowLeft') > -1)
            {
                //käännytään vastapäivään
                this.rotate-=3*rotateSpeed;
                if (this.rotate < 0) this.rotate = 360;
            }
            if (input.keys.indexOf('ArrowRight') > -1)
            {
                //käännytään myötäpäivään
                this.rotate+=3*rotateSpeed;
                if (this.rotate > 360) this.rotate = 0;
            }

           // this.centerpoint_x = this.centerpoint_x + 5 * deltaspeed * Math.sin(this.rotate * Math.PI / 180);
            //this.centerpoint_y = this.centerpoint_y + this.speedY * 0.1;

            //maan vetovoima
            //v = v0 +at
            //this.centerpoint_y += deltaspeed * 1;
          
   
            if (this.speedY > gravitaatio * 3)
            this.speedY = gravitaatio *3;
            if (this.speedY < gravitaatio * -3)
            this.speedY = gravitaatio *-3;

            if (this.speedX > gravitaatio * 3)
            this.speedX = gravitaatio *3;
            if (this.speedX < gravitaatio * -3)
            this.speedX = gravitaatio *-3;
            //console.log("speedY=", this.speedY, "speedX=",this.speedX);

            this.centerpoint_y = this.centerpoint_y - this.speedY * deltatime *0.03;
            this.centerpoint_x = this.centerpoint_x + this.speedX * deltatime *0.03;



            //lasketaan reunapisteet käännöksen jälkeen
            var radians = (Math.PI / 180) * this.rotate;
            for (let i = 0; i < this.reunapisteet.length; i++) {
                
                this.reunapisteet[i].x = this.reunapisteetOrig[i].x*Math.cos(radians) - this.reunapisteetOrig[i].y*Math.sin(radians) + this.centerpoint_x;
                this.reunapisteet[i].y = this.reunapisteetOrig[i].y*Math.cos(radians) + this.reunapisteetOrig[i].x*Math.sin(radians) + this.centerpoint_y; 
            }
            //console.log(reunaxlast, this.reunapisteetLast[1].x, this.reunapisteet[1].x);
            //luetaan pixelin väri
            let pixel = ctx2.getImageData(this.reunapisteet[1].x, this.reunapisteet[1].y, 1, 1);

            
            //haetaan reunapisteiden avulla, missä ei ole seinää canvas2 taustavärin perusteella
            //Jos piste osuu seinään, niin siirretään centerpointtia osumakohdasta keskipisteeseen päin.
            // SAMA KUIN EDELLINEN, mutta kaikilla reunapisteillä
            // MUUTEN HYVÄ, mutta voi peruuttaa pisteiden välistä seinän sisään

            //haetaan kaikkien reunapisteiden väri canvas2:sta
            for (let i = 0; i < this.reunapisteet.length; i++) {
                reunapistePixelColors[i] = ctx2.getImageData(this.reunapisteet[i].x, this.reunapisteet[i].y, 1, 1);              
            }

            //käydään kaikki reunapisteet läpi
            for (let i = 0; i < reunapistePixelColors.length; i++) {
                if (reunapistePixelColors[i].data[0] != 0){

                    //lasketaan reunapisteen etäisyys keskipisteeseen
                    let distancex = this.centerpoint_x - this.reunapisteet[i].x;
                    let distancey = this.centerpoint_y - this.reunapisteet[i].y;
                    //console.log(i, distancex, distancey);

                    //Käydään läpi keskipisteen ja seinään osuvan pisteen kaikki välit ja 
                    //lasketaan kuinka paljon pitää liikkua poispäin seinästä
                    for(let j=0; j<100; j++){

                        var tarkkailtavaetaisyysx = distancex * 0.01 * j;
                        var tarkkailtavaetaisyysy = distancey * 0.01 * j;
                        var checkX = this.reunapisteet[i].x + tarkkailtavaetaisyysx;
                        var checkY = this.reunapisteet[i].y + tarkkailtavaetaisyysy;
                        
                        //haetaan taustapixelin uusi väri
                        reunapistePixelColors[i] = ctx2.getImageData(checkX, checkY, 1, 1);

                        //console.log(i, j, checkX, checkY,distancex,distancey,'(', tarkkailtavaetaisyysx,'y', tarkkailtavaetaisyysy,')', reunapistePixelColors[i].data[0]);

                        //jos tässä kohdassa ei ole seinään, niin siirretään sen verran keskipistettä
                        if (reunapistePixelColors[i].data[0] != 255){
                            this.centerpoint_x = this.centerpoint_x + tarkkailtavaetaisyysx;
                            this.centerpoint_y = this.centerpoint_y + tarkkailtavaetaisyysy;
                                        //haetaan kaikkien reunapisteiden väri canvas2:sta
                            
                            //vaihdetaan aluksen suuntaa
                            if (Math.abs(tarkkailtavaetaisyysy) > Math.abs(tarkkailtavaetaisyysx))
                                this.speedY = this.speedY * kimmoisuus;
                            else
                                this.speedX = this.speedX * kimmoisuus;
                            break;
                        }

                    }
                    
                }
            }


             //maksimirajat ulkoseiniin
             for (let i = 0; i < this.reunapisteet.length; i++) {
                if (this.reunapisteet[i].x <-1) {
                    this.centerpoint_x = this.centerpoint_x - this.reunapisteet[i].x;
                    this.speedX = this.speedX * kimmoisuus;
                }
                if (this.reunapisteet[i].y<-1) {
                    this.centerpoint_y = this.centerpoint_y - this.reunapisteet[i].y;
                    this.speedY = this.speedY * kimmoisuus;
                }
                if (this.reunapisteet[i].x > canvas.width +1) {
                    this.centerpoint_x  = canvas.width - (this.reunapisteet[i].x -this.centerpoint_x);
                    this.speedX = this.speedX * kimmoisuus;
                }
                if (this.reunapisteet[i].y > canvas.height +1) {
                    this.centerpoint_y = canvas.height - (this.reunapisteet[i].y -this.centerpoint_y);
                    this.speedY = this.speedY * kimmoisuus;
                }
            }   
            //päivitetään reunapisteet vielä piirtoa varten, jos mennyt maksimirajojen yli
            for (let i = 0; i < this.reunapisteet.length; i++) {
                this.reunapisteet[i].x = this.reunapisteetOrig[i].x*Math.cos(radians) - this.reunapisteetOrig[i].y*Math.sin(radians) + this.centerpoint_x;
                this.reunapisteet[i].y = this.reunapisteetOrig[i].y*Math.cos(radians) + this.reunapisteetOrig[i].x*Math.sin(radians) + this.centerpoint_y; 
            }

        }
                
        draw(){
            this.drawRotateTranslate();
        }
   
        drawRotateTranslate(){

            //koska muokataan canvasta, niin savetetaan parametrit ja palautetaan myöhemmin
            ctx.save();
            ctx2.save();

            //piirretään neliö pisteistä
            for (let i = 0; i < this.reunapisteet.length; i++) {
                ctx.fillRect(this.reunapisteet[i].x-5, this.reunapisteet[i].y-5,10,10); 
            }

            //täytetään alue
            ctx.beginPath();
            ctx.moveTo(this.reunapisteet[0].x, this.reunapisteet[0].y);
            for (let i = 1; i < this.reunapisteet.length; i++) {
                ctx.lineTo(this.reunapisteet[i].x, this.reunapisteet[i].y);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.fillStyle = "yellow";
            ctx.fill();

            //liekki
            if (this.kaasuPaalla == 1)
            {
                ctx.fillStyle = "red";
                ctx.fillRect((this.reunapisteet[3].x + this.reunapisteet[4].x)/2 -20, (this.reunapisteet[3].y + this.reunapisteet[4].y)/2 -20,40,40); 
            }

            //palautetaan canvas arvot
            ctx.restore();
            ctx2.restore();
        }

    }



    const ajoneuvo1 = new ajoneuvo();
    const raketti1 = new raketti();
    const input = new InputHandler();
    console.log(ctx);
    //window.addEventListener('keydown', function(e){;
            //console.log(e);
    //});


    ctx2.fillRect(810, 210,50,500);

    let imgData1 = ctx2.getImageData(0,0,canvas2.width,canvas2.height);
    // { data: [r,g,b,a,r,g,b,a,r,g,..], ... }
    
    function getPixel(imgData, index) {
      var i = index*4, d = imgData.data
      return [d[i],d[i+1],d[i+2],d[i+3]] // Returns array [R,G,B,A]
    }
    
    // AND/OR
    
    function getPixelXY(imgData, x, y) {
      return getPixel(imgData, y*imgData.width+x)
    }


    let pixeldata = getPixel(imgData1, 315, 315);
    console.log(imgData1, "pixeldate243243223:",pixeldata);


    var imageRed = document.getElementById('playerImageRed');
    //imageRed.setAttribute("style", "transform: rotate(180)");
    imageRed.style.transform = "rotate(165deg)";
    imageRed.style.left = "300px"

    function animate(timeStamp){
    
        //lasketaan delttatime. Käytetään hyväksi ruutupäivityksissä
        let deltatime = timeStamp - lastTime;
        //console.log(deltatime);
        if (timeStamp-lastTime>10) //framerate testit
        {   
            lastTime=timeStamp;
            //ajoneuvo1.update(deltatime, input); 
            raketti1.update(deltatime, input); 

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            //ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
            //ajoneuvo1.draw();
            raketti1.draw();



        }
        //console.log(!(ajoneuvo1.x > canvas.width));
        if (!(ajoneuvo1.x > canvas.width))
        {
            //console.log(!(ajoneuvo1.x > canvas.width));
            requestAnimationFrame(animate);
        }
        if (!(raketti1.x > canvas.width))
        {
            //console.log(!(raketti1.x > canvas.width));
            //requestAnimationFrame(animate);
        }
    }
    animate(0);
});