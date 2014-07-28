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

function save_to_cookie(char){
    $.each(char, function(slot, data){
        $.cookie('d3planner_'+slot, data);
    });
}

function load_from_cookie(char){
    $(".slot").each(function(){
        var slot = $(this).attr("id");
        var cookie_name = 'd3planner_'+slot;
        if($.cookie(cookie_name))
            char[slot] = $.cookie(cookie_name);
    });
}

function get_stat_color(min,max,val){
    return percent_to_color((val-min)/(max-min));
}

function percent_to_color(percent){
    R=Math.ceil(255*(1-percent));
    G=Math.floor(255*percent);
    B=parseInt(0);
    //alert([R,G,B]);
    R=R.toString(16);
    G=G.toString(16);
    B=B.toString(16);
    //alert([R,G,B]);

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

function calculate_base_damage(values, defaults, damage){
    if (defaults && values){
        if (!damage)
            damage = ((values.max || defaults.max)+(values.min || defaults.min))/2;

        ms = values.ms || defaults.ms;

        //alert(["damage*(1+ms/100)",damage,ms,damage*(1+ms/100)]);
        return damage*(1+ms/100);
    }
}
function calculate_crit_damage(values, defaults, base_damage){
    if (defaults && values){
        if (!base_damage)
            base_damage = calculate_base_damage(values,defaults);

        chd = values.chd || defaults.chd;

        //alert(["base_damage*(chd/100)",chd,base_damage*(chd/100)]);
        return base_damage*(chd/100)
    }
}
function calculate_mean_damage(values, defaults, crit_damage){
    if (defaults && values){
        if (!crit_damage)
            base_damage = calculate_base_damage(values,defaults);

        chd = values.chd || defaults.chd;
        chc = values.chc || defaults.chc;

        //alert(["base_damage*(1+chc/100*chd/100)",chc,chd,base_damage*(1+chc/100*chd/100)]);
        return base_damage*(1+chc/100*chd/100);
    }
}
function calculate_dps(values, defaults, mean_damage){
    if (defaults && values){
        if (!mean_damage)
            mean_damage = calculate_mean_damage(values,defaults);

        as = values.as || defaults.as;
        aps = values.aps || defaults.aps;

        //alert(["mean_damage*(1+as/100)*(aps)",mean_damage*(1+as/100)*(aps)]);
        return mean_damage*(1+as/100)*(aps);
    }
}