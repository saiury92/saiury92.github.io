/**
 * Created by saiury on 10/01/18.
 */
let n;

function quote($el, message){
  $el.textContent = '';
  n = 0;
  typist(message, $el);
}

function interval(letter){
  if(letter == ';' || letter == '.' || letter == ','){
    return Math.floor((Math.random() * 500) + 500);
  } else {
    return Math.floor((Math.random() * 130) + 5);
  }
}

function typist(text, target){
  if(typeof(text[n]) != 'undefined'){
    target.textContent += text[n];
  }
  n++;
  if(n < text.length){
    setTimeout(function(){
      typist(text, target)
    }, interval(text[n - 1]));
  }
}
