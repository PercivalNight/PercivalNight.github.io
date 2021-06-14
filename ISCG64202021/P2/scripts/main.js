$(document).ready(function () {

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    var dino = new Image();
    dino.src = "image/dino.png"; // sprite sheet

    var title = new Audio('sound/title.mp3');
    var bgm = new Audio('sound/bgm.mp3');
    var finish = new Audio('sound/finish.mp3');
    var laugh = new Audio('sound/laugh.mp3');
    var sad = new Audio('sound/sad.mp3');

    var sheet = { // sprite sheet
        width: 372,
        height: 480
    };

    var player = { // init player
        x: canvas.width / 2, // position in canvas
        y: canvas.height / 2,
        sx: 0, // position in sprite sheet
        sy: 0,
        width: sheet.width / 4 - 3,
        height: sheet.height / 4
    };

    var frame = 0; // sx of sprite sheet
    var direction = 0; // sy of sprite sheet
    var keys = [];
    var eat = false;

    canvas.addEventListener("keydown", function(event) {
        if (event.preventDefaulted) {
            return; // Do nothing if event already handled
        }

        switch(event.code) {
            case "KeyS": case "ArrowDown":
                if (player.y <= canvas.height - player.height - 10) { // check wall
                    player.y += 10;
                    direction = 0; // 0 = face down
                }
                break;

            case "KeyA": case "ArrowLeft":
                if (player.x >= 10) {
                    player.x -= 10;
                    direction = 1; // 1 = face left
                }
                break;

            case "KeyD": case "ArrowRight":
                if (player.x <= canvas.width - player.width - 10) {
                    player.x += 10;
                    direction = 2; // 2 = face right
                }
                break;

            case "KeyW": case "ArrowUp":
                if (player.y >= 10) {
                    player.y -= 10;
                    direction = 3; // 3 = face up
                }
                break;

            case "Space":
                eat = true;
                break;
        }

        event.preventDefault(); // Consume the event so it doesn't get handled twice
    }, true);

    canvas.addEventListener("keyup", function(event) {
        if (event.code === "Space") {
            eat = false;
        }
    }, true);

    var worm1 = { // init worm
        x: getRandomInRange(0, canvas.width * 3/4),
        y: getRandomInRange(0, canvas.height -10),
        vx: getRandomInRange(-6, 6),
        vy: getRandomInRange(-3, 3),
        r: 5,
        lc: 0
    };
    var worm2 = { // init worm
        x: getRandomInRange(0, canvas.width * 3/4),
        y: getRandomInRange(0, canvas.height -10),
        vx: getRandomInRange(-6, 6),
        vy: getRandomInRange(-3, 3),
        r: 5,
        lc: 0
    };
    var worms = [];
    worms.push(worm1);
    worms.push(worm2);

    window.requestAnimationFrame(gameLoop); // start the first frame request
    var fps = 15;
    function gameLoop() {
        setTimeout(function () {
            window.requestAnimationFrame(gameLoop);
            update();
        }, 1000 / fps);
    }

    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // player
        frame = ++ frame % 4;
        player.sx = frame * (player.width + 3);
        player.sy = direction * player.height;
        ctx.drawImage(dino, player.sx, player.sy, player.width, player.height, player.x, player.y, player.width, player.height);

        // worms
        if (Math.random() < 0.03) { // Check if we should generate a new object
            worms.push({
                x: getRandomInRange(0, canvas.width * 3/4),
                y: getRandomInRange(0, canvas.height -10),
                vx: getRandomInRange(-6, 6),
                vy: getRandomInRange(-3, 3),
                r: 5,
                lc: 0
            });
        }
        for (let i = 0; i < worms.length; i++) {
            checkWall(worms[i]);
            // checkObject(worms[i]);
            switch (worms[i].lc) {
                case 0:
                    worms[i].x += worms[i].vx;
                    worms[i].y += worms[i].vy;
                    worms[i].lc = 1;
                    break;

                case 1:
                    worms[i].x += worms[i].vx;
                    worms[i].y += worms[i].vy;
                    worms[i].r += 0.25;
                    if (worms[i].r > 25) {
                        worms[i].lc = 2
                    }
                    break;

                case 2:
                    worms[i].x += worms[i].vx;
                    worms[i].y += worms[i].vy;
                    worms[i].r -= 0.25;
                    if (worms[i].r < 2) {
                        worms[i].lc = 3
                    }
                    break;

                case 3:
                    worms[i].x = getRandomInRange(0, canvas.width * 3/4);
                    worms[i].y = getRandomInRange(0, canvas.height - 10);
                    worms[i].lc = 0;
                    break;
            }

            var gradient = ctx.createRadialGradient(worms[i].x, worms[i].y, worms[i].r, worms[i].x, worms[i].y, worms[i].r/2);
            gradient.addColorStop(0, 'rgb(255,255,255)');
            gradient.addColorStop(0.5, 'rgb(255,255,0)');
            gradient.addColorStop(1, 'rgb(255,100,0)');
            ctx.beginPath();
            ctx.arc(worms[i].x, worms[i].y, worms[i].r, Math.PI, 0, false);
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgb(0, 0, 0)';
            ctx.closePath();
            ctx.stroke();
        }
    }

    function checkWall(worm) {
        if ((worm.x >= canvas.width * 3/4) || (worm.x <= worm.r)) { // reach right or left
            worm.vx = -worm.vx; // inverse direction x
        }
        if ((worm.y >= canvas.clientHeight) || (worm.y <= worm.r)) { // reach bottom or top
            worm.vy = -worm.vy; // inverse direction y
        }
    }

// function check(x, y, w, h) {
//     for (i = 0; i < boxs.length; i++) {
//         var x1=boxs[i][0];
//         var y1=boxs[i][1];
//         var w1=boxs[i][2];
//         var h1=boxs[i][3];
//         if (intersects(x, y, w, h, x1, y1, w1, h1))
//         {
//             // alert (" x=" +x1 +" y=" +y1 +" w=" +w1 +" h=" + h1);
//             if (drawPlayer()) {
//                 playSound('sound/laugh.mp3');
//                 sc+=1;
//                 boxs.splice(i, 1);
//                 eat = false;
//             } else { playSound('sound/sad.mp3'); }
//         }
//     }
// }
//
// function intersects(xp, yp, wp, hp, xo, yo, wo, ho) {
//     wo += xo;
//     wp += xp;
//     if (xo > wp || xp > wo) return false;
//     ho += yo;
//     hp += yp;
//     if (yo > hp || yp > ho) return false;
//     return true; // returns true if there is any overlap
// }
//
// function updateCanvas() {
//     ctx.clearRect(0,0, canvas.width,canvas.height); //Clear Canvas
//
//     //Check if we should generate a new object
//     if (Math.random() < 0.03) {
//         xu = -20;
//         yu = Math.floor(Math.random() * canvas.height);
//         boxs.push([xu, yu, 40, 40]);
//     }
//
//     //Update the position of objects
//     for (var i = boxs.length - 1; i >= 0; i--) {
//         if (boxs[i][0] < canvas.width / 4) { // stage 1
//             boxs[i][0] = boxs[i][0] + (Math.random() * 8 + 2); // moving in different speeds
//             ctx.beginPath();
//             ctx.arc(boxs[i][0], boxs[i][1], 20, Math.PI * 2, 0, true);
//             ctx.closePath();
//             ctx.fillStyle = "rgba(255,60,20,0.60)";
//             ctx.fill();
//         }
//         else if (boxs[i][0] < canvas.width / 2) { // stage 2
//             boxs[i][0] = boxs[i][0] + (Math.random() * 4);
//             ctx.beginPath();
//             ctx.arc(boxs[i][0], boxs[i][1], 30, Math.PI * 2, 0, true);
//             ctx.closePath();
//             ctx.fillStyle = "rgba(255,60,20,1)";
//             ctx.fill();
//         }
//         else if (boxs[i][0] < canvas.width * 3 / 4) { // stage 3
//             boxs[i][0] = boxs[i][0] + (Math.random() * 3 + 1);
//             ctx.beginPath();
//             ctx.arc(boxs[i][0], boxs[i][1], 20, Math.PI * 2, 0, true);
//             ctx.closePath();
//             ctx.fillStyle = "rgba(255,60,20,1)";
//             ctx.fill();
//         }
//         else { // stage 4
//             boxs.splice(i, 1);
//         }
//     }
//     writeScore(sc); // update score
// }
//
// function playSound(soundfile)
// {
//     document.getElementById("dummy").innerHTML=
//         "<embed src=\""+soundfile+"\" hidden=\"true\" autostart=\"true\" loop=\"false\" />";
// }
//
// function writeScore(sc) {
//     // Transparent black text
//     ctx.font = '25px "MS UI Gothic"';
//     ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
//     ctx.fillText("SCORE: " +sc, 0, 30);
// }

    function getRandomInRange(min, max) {
        return Math.random() * (Math.abs(min) + max) + min;
    }
});