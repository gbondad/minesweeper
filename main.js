

let MSGame = (function(){

  // private constants
  const STATE_HIDDEN = "hidden";
  const STATE_SHOWN = "shown";
  const STATE_MARKED = "marked";

  function array2d( nrows, ncols, val) {
    const res = [];
    for( let row = 0 ; row < nrows ; row ++) {
      res[row] = [];
      for( let col = 0 ; col < ncols ; col ++)
        res[row][col] = val(row,col);
    }
    return res;
  }

  // returns random integer in range [min, max]
  function rndInt(min, max) {
    [min,max] = [Math.ceil(min), Math.floor(max)]
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  class _MSGame {
    constructor() {
      this.init(8,10,10); // easy
    }

    validCoord(row, col) {
      return row >= 0 && row < this.nrows && col >= 0 && col < this.ncols;
    }

    init(nrows, ncols, nmines) {
      this.nrows = nrows;
      this.ncols = ncols;
      this.nmines = nmines;
      this.nmarked = 0;
      this.nuncovered = 0;
      this.exploded = false;
      // create an array
      this.arr = array2d(
        nrows, ncols,
        () => ({mine: false, state: STATE_HIDDEN, count: 0}));
    }

    count(row,col) {
      const c = (r,c) =>
            (this.validCoord(r,c) && this.arr[r][c].mine ? 1 : 0);
      let res = 0;
      for( let dr = -1 ; dr <= 1 ; dr ++ )
        for( let dc = -1 ; dc <= 1 ; dc ++ )
          res += c(row+dr,col+dc);
      return res;
    }
    sprinkleMines(row, col) {
        // prepare a list of allowed coordinates for mine placement
      let allowed = [];
      for(let r = 0 ; r < this.nrows ; r ++ ) {
        for( let c = 0 ; c < this.ncols ; c ++ ) {
          if(Math.abs(row-r) > 2 || Math.abs(col-c) > 2)
            allowed.push([r,c]);
        }
      }
      this.nmines = Math.min(this.nmines, allowed.length);
      for( let i = 0 ; i < this.nmines ; i ++ ) {
        let j = rndInt(i, allowed.length-1);
        [allowed[i], allowed[j]] = [allowed[j], allowed[i]];
        let [r,c] = allowed[i];
        this.arr[r][c].mine = true;
      }
      // erase any marks (in case user placed them) and update counts
      for(let r = 0 ; r < this.nrows ; r ++ ) {
        for( let c = 0 ; c < this.ncols ; c ++ ) {
          if(this.arr[r][c].state == STATE_MARKED){
            this.arr[r][c].state = STATE_HIDDEN;
            this.nmarked -=1;
          }
          this.arr[r][c].count = this.count(r,c);
        }
      }
      let mines = []; let counts = [];
      for(let row = 0 ; row < this.nrows ; row ++ ) {
        let s = "";
        for( let col = 0 ; col < this.ncols ; col ++ ) {
          s += this.arr[row][col].mine ? "B" : ".";
        }
        s += "  |  ";
        for( let col = 0 ; col < this.ncols ; col ++ ) {
          s += this.arr[row][col].count.toString();
        }
        mines[row] = s;
      }
      console.log("Mines and counts after sprinkling:");
      console.log(mines.join("\n"), "\n");
    }
    // puts a flag on a cell
    // this is the 'right-click' or 'long-tap' functionality
    uncover(row, col) {
      console.log("uncover", row, col);
      // if coordinates invalid, refuse this request
      if( ! this.validCoord(row,col)) return false;
      // if this is the very first move, populate the mines, but make
      // sure the current cell does not get a mine
      if( this.nuncovered === 0)
        this.sprinkleMines(row, col);
      // if cell is not hidden, ignore this move
      if( this.arr[row][col].state !== STATE_HIDDEN) return false;
      // floodfill all 0-count cells
      const ff = (r,c) => {
        if( ! this.validCoord(r,c)) return;
        if( this.arr[r][c].state !== STATE_HIDDEN) return;
        this.arr[r][c].state = STATE_SHOWN;
        this.nuncovered ++;
        if( this.arr[r][c].count !== 0) return;
        ff(r-1,c-1);ff(r-1,c);ff(r-1,c+1);
        ff(r  ,c-1);         ;ff(r  ,c+1);
        ff(r+1,c-1);ff(r+1,c);ff(r+1,c+1);
      };
      ff(row,col);
      // have we hit a mine?
      if( this.arr[row][col].mine) {
        this.exploded = true;
      }
      return true;
    }
    // uncovers a cell at a given coordinate
    // this is the 'left-click' functionality
    mark(row, col) {
      console.log("mark", row, col);
      // if coordinates invalid, refuse this request
      if( ! this.validCoord(row,col)) return false;
      // if cell already uncovered, refuse this
      console.log("marking previous state=", this.arr[row][col].state);
      if( this.arr[row][col].state === STATE_SHOWN) return false;
      // accept the move and flip the marked status
      this.nmarked += this.arr[row][col].state == STATE_MARKED ? -1 : 1;
      this.arr[row][col].state = this.arr[row][col].state == STATE_MARKED ?
        STATE_HIDDEN : STATE_MARKED;
      return true;
    }
    // returns array of strings representing the rendering of the board
    //      "H" = hidden cell - no bomb
    //      "F" = hidden cell with a mark / flag
    //      "M" = uncovered mine (game should be over now)
    // '0'..'9' = number of mines in adjacent cells
    getRendering() {
      const res = [];
      for( let row = 0 ; row < this.nrows ; row ++) {
        let s = "";
        for( let col = 0 ; col < this.ncols ; col ++ ) {
          let a = this.arr[row][col];
          if( this.exploded && a.mine) s += "M";
          else if( a.state === STATE_HIDDEN) s += "H";
          else if( a.state === STATE_MARKED) s += "F";
          else if( a.mine) s += "M";
          else s += a.count.toString();
        }
        res[row] = s;
      }
      return res;
    }
    getStatus() {
      let done = this.exploded ||
          this.nuncovered === this.nrows * this.ncols - this.nmines;
      return {
        done: done,
        exploded: this.exploded,
        nrows: this.nrows,
        ncols: this.ncols,
        nmarked: this.nmarked,
        nuncovered: this.nuncovered,
        nmines: this.nmines
      }
    }
  }

  return _MSGame;

})();



let game = new MSGame();

game.init(8, 10, 10);

var tmr = 0;
var islong = 0;

const $grid = $('.grid');

$('.grid').css('gridTemplateColumns',`repeat(${game.ncols}, 1fr)`)

renderBoard();

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
  console.log(game.getStatus());
}

status = 0;
function eventHold(event){

  game.mark($(event.target).data('row'),$(event.target).data('col'));
  console.log("mouse hold");
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



  // disable right click
$('.grid').bind('contextmenu', function(e){
  return false;
});


 

  let t = 0;
  let timer = null;
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
 // diff = 0;
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
//  diff = 1;
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
//  diff = 2;
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







