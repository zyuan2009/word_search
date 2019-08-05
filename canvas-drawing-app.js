var canvas;
var context;
var canvasWidth = 1000;
var canvasHeight = 1600;
var colorGreen = "#659b41";
var character_array;
var word_array;
var character_file_ready = false;
var word_file_ready = false;
var word_locations = [];
var neighbor = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];
var word_coordinates = [];
var previous_selected = -1;

function findWordLocation(raw_word) {
    var word = "";
    for (var i = 0; i < raw_word.length; i++) {
        if (raw_word[i] != ' ') {
            word = word + raw_word[i];
        }
    }
    for (var i = 0; i < character_array.length; i++) {
        for (var j = 0; j < character_array[i].length; j++) {
            if (character_array[i][j] == word[0]) {
                for (var d = 0; d < 8; d++) {
                    var k = 1;
                    for (; k < word.length; k++) {
                        var x = j + neighbor[d][0] * k;
                        var y = i + neighbor[d][1] * k;
                        if (x < 0 || x >= character_array[i].length || y < 0 || y >= character_array.length) {
                            break;
                        }
                        if (word[k] != character_array[y][x]) {
                            break;
                        }
                    }
                    if (k == word.length) {
                        return [j, i, j + neighbor[d][0] * (k - 1), i + neighbor[d][1] * (k - 1)];
                    }
                }
            }
        }
    }
    return [];
}

function computeAllMatches() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = "20px Arial";
    context.fillStyle = colorGreen;
    if (character_file_ready) {
        for (var i = 0; i < character_array.length; i++) {
            for (var j = 0; j < character_array[i].length; j++) {
                context.fillText(character_array[i][j], 50 + j * 20, 50 + i * 20);
            }
        }
    }
    if (word_file_ready) {
        var x = 50;
        var y = 870;
        for (var i = 0; i < word_array.length; i++) {
            var text_size = context.measureText(word_array[i]);
            if (x + text_size.width >= 850) {
                x = 50;
                y = y + 20;
            }
            context.fillText(word_array[i], x, y);
            word_coordinates.push([x, y - 20, text_size.width, 20]);
            x = x + text_size.width + 20;
            x = x - (x % 50) + 50;
        }
    }
    if (!character_file_ready || !word_file_ready) {
        return;
    }
    for (var i = 0; i < word_array.length; i++) {
        word_locations.push(findWordLocation(word_array[i]));
    }
}

function handleWordFileSelect(evt) {
    var word_file_name = document.getElementById("word_file_name").files[0];
    var reader = new FileReader();
    reader.onloadend = function(evt){
        var word_file_content = evt.target.result;
        word_array_lines = word_file_content.split("\n");
        word_array_lines.filter(function(s){
            return s.length > 0;
        });
        word_array = [];
        word_array_lines.forEach(function(element, index, array){
            var sub_word_array = element.split(",");
            word_array = word_array.concat(sub_word_array);
        });
        word_array = word_array.map(function(s){
            return s.trim();
        });
        word_array = word_array.filter(function(s){
            return s.length > 0;
        });
        word_file_ready = true;
        computeAllMatches();
    };
    reader.readAsText(word_file_name);
}

function handleCharacterFileSelect(evt) {
    var character_file_name = document.getElementById("character_file_name").files[0];
    var reader = new FileReader();
    reader.onloadend = function(evt){
        var character_file_content = evt.target.result;
        character_array = character_file_content.split("\n");
        character_array = character_array.filter(function(s){
            return s.length > 0;
        });
        
        character_file_ready = true;
        computeAllMatches();
    };
    reader.readAsText(character_file_name);
}

function redrawWord(selected, color) {
    context.clearRect(word_coordinates[selected][0],
        word_coordinates[selected][1],
        word_coordinates[selected][2],
        word_coordinates[selected][3]);
    context.font = "20px Arial";
    context.fillStyle = color;
    var selected_text = "";
    for (var i = 0; i < word_array[selected].length; i++) {
        if (word_array[selected][i] != ' ') {
            selected_text = selected_text + word_array[selected][i];
        }
    }
    context.fillText(selected_text,
        word_coordinates[selected][0],
        word_coordinates[selected][1] + word_coordinates[selected][3]);
    var dx = (word_locations[selected][2] - word_locations[selected][0]) /
        (selected_text.length - 1);
    var dy = (word_locations[selected][3] - word_locations[selected][1]) /
        (selected_text.length - 1);
    var x = word_locations[selected][0];
    var y = word_locations[selected][1];
    for (var i = 0; i < selected_text.length; i++) {
        context.clearRect(50 + x * 20, 50 + y * 20 - 20, 20, 20);
        context.fillText(selected_text[i], 50 + x * 20, 50 + y * 20);
        x = x + dx;
        y = y + dy;
    }
}

function redrawSelected(selected) {
    if (previous_selected == selected) {
        return;
    }
    var saved_previous_selected = previous_selected;
    if (saved_previous_selected != -1) {
        redrawWord(saved_previous_selected, colorGreen);
    }
    if (selected != -1) {
        redrawWord(selected, "blue");
    }
    previous_selected = selected;
}

function handleMouseMove(e) {
    var mouseX = e.pageX - this.offsetLeft;
    var mouseY = e.pageY - this.offsetTop;
    if (mouseY >= 850 && word_file_ready) {
        for (var i = 0; i < word_coordinates.length; i++) {
            var left = word_coordinates[i][0];
            var top = word_coordinates[i][1];
            var right = word_coordinates[i][2] + word_coordinates[i][0];
            var bottom = word_coordinates[i][3] + word_coordinates[i][1];
            if (left <= mouseX && top <= mouseY && right >= mouseX && bottom >= mouseY) {
                if (i != previous_selected) {
                    redrawSelected(i);
                }
                return;
            }
        }
    }
    redrawSelected(-1);
}

function prepareCanvas()
{
    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      // Great success! All the File APIs are supported.
    } else {
      alert('The File APIs are not fully supported in this browser.');
    }

    document.getElementById('character_file_name').addEventListener('change', handleCharacterFileSelect, false);
    document.getElementById('word_file_name').addEventListener('change', handleWordFileSelect, false);

	var canvasDiv = document.getElementById('canvasDiv');
	canvas = document.createElement('canvas');
	canvas.setAttribute('width', canvasWidth);
	canvas.setAttribute('height', canvasHeight);
	canvas.setAttribute('id', 'canvas');
	canvasDiv.appendChild(canvas);
	if(typeof G_vmlCanvasManager != 'undefined') {
		canvas = G_vmlCanvasManager.initElement(canvas);
	}
    context = canvas.getContext("2d"); // Grab the 2d canvas context
    context.font = "12px Arial";

	$('#canvas').mousemove(handleMouseMove);
}