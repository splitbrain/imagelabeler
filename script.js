var WIDTH = 1000;
var imageLoader = document.getElementById('imageLoader');
imageLoader.addEventListener('change', handleImage, false);
var canvas = document.getElementById('imageCanvas');
var ctx = canvas.getContext('2d');
var scale = 1.0;
var img;

var ta = document.getElementById('data');
ta.addEventListener('keyup', draw);


document.getElementById('jpg').addEventListener('click', function () {
    this.href = canvas.toDataURL('image/jpg');
}, false);
document.getElementById('png').addEventListener('click', function () {
    this.href = canvas.toDataURL('image/png');
}, false);


function handleImage(e) {
    var reader = new FileReader();
    reader.onload = function (event) {
        img = new Image();
        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;

            // calculate scaling
            var max = Math.max(img.width, img.height);
            if (max > WIDTH) {
                scale = WIDTH / max;
            }
            canvas.parentNode.style.transform = 'scale(' + scale + ')'; // scale down
            scale = 1 / scale; // from now on we need to scale up

            // make stuff visible
            canvas.style.display = 'block';
            document.getElementById('editor').style.display = 'block';
            draw();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);


    getdata();

    ctx.beginPath();
    ctx.arc(600, 600, 70, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'green';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#003300';
    ctx.stroke();


    makeLabel(600, 600, 'Hello World', 'right');

}

function getdata() {
    var lines = ta.value.split('\n');
    lines = lines.map(Function.prototype.call, String.prototype.trim);

    var re = /^([<>=])?(\d+),(\d+)\s(.+)$/;
    for (var i = 0; i < lines.length; i++) {
        var match = lines[i].match(re);
        if (match) {
            var align = 'left';
            if (match[1] == '>') align = 'right';
            if (match[1] == '=') align = 'center';

            makeLabel(match[2], match[3], match[4].trim(), align);
        }
    }
}

/**
 *
 * @param {int} x
 * @param {int} y
 * @param {string} text
 * @param {string} align 'left'|'center'|'right'
 */
function makeLabel(x, y, text, align) {
    var fontsize = Math.ceil(20 * scale);
    var padding = Math.ceil(2 * scale);

    // set up and measure font
    ctx.font = fontsize + 'px sans-serif';
    ctx.textBaseline = 'top';
    var box = ctx.measureText(text);

    if (align == 'right') x = x - box.width;
    if (align == 'center') x = Math.round(x - box.width / 2);

    // draw box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(x - padding, y - padding, box.width + padding * 2, fontsize + padding * 2);

    // draw text
    ctx.fillStyle = '#000000';
    ctx.fillText(text, x, y);

}


canvas.addEventListener("mousedown", getPosition, false);

function getPosition(event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    // scale up
    x = Math.round(x * scale);
    y = Math.round(y * scale);

    var start = ta.selectionStart - 1;
    start = ta.value.lastIndexOf("\n", start) + 1;
    var end = ta.value.indexOf("\n", start);
    if (end < start) end = start;
    var line = ta.value.substring(start, end);
    var align = '<';
    var go;

    var re = /^([<>=])?(\d*,\d*)?(\s.*)$/;
    var match = line.match(re);
    if (match) {
        // modify an existing line
        if (match[1]) align = match[1];
        var text = '';
        if (match[3]) text = match[3].trim();

        line = align + x + ',' + y + ' ' + text;
        go = start + line.length;
    } else {
        // create a new line
        var last = Math.max(
            ta.value.lastIndexOf('<', start),
            ta.value.lastIndexOf('>', start),
            ta.value.lastIndexOf('=', start)
        );
        if (last >= 0) align = ta.value.substr(last, 1);

        line = align + x + ',' + y + ' ';
        go = start + line.length;
    }
    ta.value = ta.value.substring(0, start) + line + ta.value.substring(end);
    ta.value = ta.value.replace(/[\r\n]$/, '') + "\r\n";

    ta.selectionStart = go;
    ta.selectionEnd = go;

    draw();
    window.setTimeout(function () {
        ta.focus();
    }, 100);

}