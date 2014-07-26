if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

function get_stat_color(min,max,val){
    return percent_to_color((val-min)/(max-min));
}

function percent_to_color(percent){
    R=Math.ceil(255*(1-percent));
    G=Math.floor(255*percent);
    B=parseInt(0);

    R=R.toString(16);
    G=G.toString(16);
    B=B.toString(16);

    while(R.length < 2){
        R = "0"+R;
    }
    while(G.length < 2){
        G = "0"+G;
    }
    while(B.length < 2){
        B = "0"+B;
    }

    return "#"+R+G+B;
}