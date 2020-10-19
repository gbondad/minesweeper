let game = new MSGame();

game.init(8, 10, 10);
const $grid = $('.grid');
$('.grid').css('gridTemplateColumns',`repeat(${game.ncols}, 1fr)`)
renderBoard();
  // disable right click
$('.grid').bind('contextmenu', function(e){
  return false;
});

function renderBoard(){
  document.querySelectorAll(".flags").forEach(
    (e)=> {
      e.textContent = String(game.getStatus().nmines - game.getStatus().nmarked);
    });
  $(".grid").html("");
  for (let i = 0; i < game.getRendering().length; i++){
    for(let j = 0; j < game.getRendering()[i].length; j++){
      const $card = $("<div></div>");
      $card.bind('taphold',eventHold);
      $card.bind('click',eventClick);

      switch(game.getRendering()[i][j]){
        case 'H':
          $card.addClass('card hidden');
          break;
        case 'F':
          $card.addClass('card flagged');
          break;  
        case 'M':
          $card.addClass('card mine');
          break;
        case '0':
          $card.addClass('card zero');   
          break;
        case '1':
          $card.addClass('card one');
          break;
        case '2':
          $card.addClass('card two');
          break;    
        case '3':
          $card.addClass('card three');
          break;
        case '4':
          $card.addClass('card four');
          break;  
        case '5':
          $card.addClass('card five');
          break;   
        case '6':
          $card.addClass('card six');
          break;
        case '7':
          $card.addClass('card seven');
          break;  
        case '8':
          $card.addClass('card eight');
          break;  
        case '9':
          $card.addClass('card nine');
          break;               
      }
      $card.attr('data-row',i)
      .attr('data-col',j);
      $grid.append($card);

    }
  }
  if(game.getStatus().exploded){
    stop();
    document.getElementById("endmessage").innerHTML = "You Lost";
    document.querySelector("#overlay").classList.toggle("active");
  }
  else if(game.getStatus().done){
    stop();
    document.getElementById("endmessage").innerHTML = "You Won";
    document.querySelector("#overlay").classList.toggle("active");
  }
  //console.log(game.getStatus());
}

status = 0;
function eventHold(event){
  game.mark($(event.target).data('row'),$(event.target).data('col'));
  //console.log("mouse hold");
  renderBoard();
  }

function eventClick(event){
  if(status == 0){
    start();
    status = 1;
  }
  game.uncover($(event.target).data('row'),$(event.target).data('col'));
  renderBoard()
  }



  let t = 0;
  let timer = null;
  // timer code
  function start() {
    t = 0;
    timer = null;

    timer = setInterval(function(){
      t++;
      document.getElementById("Timer").innerHTML = t;
    }, 1000);  
  }
  
  function stop(){
    if(timer) window.clearInterval(timer);
  }

var diff = 0;

$("#easy").click(function() {
  if(status == 1){
    stop();
    status = 0;
  }
  document.getElementById("Timer").innerHTML = 0;
  game.init(8, 10, 10);
  $('.grid').css('gridTemplateColumns',`repeat(${game.ncols}, 1fr)`)
  renderBoard();
  diff = 0;
});

$("#normal").click(function() {
  if(status == 1){
    stop();
    status = 0;
  }
  document.getElementById("Timer").innerHTML = 0;
  game.init(14, 18, 40);
  $('.grid').css('gridTemplateColumns',`repeat(${game.ncols}, 1fr)`)
  renderBoard();
  diff = 1;
});

$("#hard").click(function() {
  if(status == 1){
    stop();
    status = 0;
  }
  document.getElementById("Timer").innerHTML = 0;
  game.init(20, 24, 99);
  $('.grid').css('gridTemplateColumns',`repeat(${game.ncols}, 1fr)`)
  renderBoard();
  diff = 2;
});



function restart(){
  status = 0;
  time = 0;
  timer = null;
  document.getElementById("Timer").innerHTML = 0;
  if(diff == 0){
    game.init(8, 10, 10);
  }
  else if(diff == 1){
    game.init(14, 18, 40);
  }
  else if(diff = 2){
    game.init(20, 24, 99);
  }
  $('.grid').css('gridTemplateColumns',`repeat(${game.ncols}, 1fr)`)
  renderBoard();
}


$('#overlay').bind('click',overlay);


function overlay(event){
  document.querySelector("#overlay").classList.remove("active");
  restart();
}







