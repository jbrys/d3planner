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

if (!Array.prototype.max) {
	Array.prototype.max = function( array ){
		return Math.max.apply( Math, array );
	};
}

function save_to_cookie(char){
    $.each(_cookies, function(i, slot){
        $.cookie('d3planner_'+slot, char[slot]);
    });
}

function load_from_cookie(char){
    $.each(_cookies, function(i, slot){
        var cookie_name = 'd3planner_'+slot;
        if($.cookie(cookie_name))
            char[slot] = $.cookie(cookie_name);
    });
}

function get_stat_color(min,max,val){
    return percent_to_color((val-min)/(max-min));
}

function percent_to_color(percent){
    R=Math.ceil(200*(1-percent));
    G=Math.floor(100*percent);
    B=parseInt(64);
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
            damage = ((values.max_damage || defaults.max_damage)+(values.min_damage || defaults.min_damage))/2;

        ms = values.main_stat || defaults.main_stat;

        return damage*(1+ms/100);
    }
}
function calculate_crit_damage(values, defaults, base_damage){
    if (defaults && values){
        if (!base_damage)
            base_damage = calculate_base_damage(values,defaults);

        chd = 1+((values.critical_hit_damage || defaults.critical_hit_chance)/100);

        return base_damage*chd
    }
}
function calculate_mean_damage(values, defaults, crit_damage){
    if (defaults && values){
        if (!crit_damage)
            base_damage = calculate_base_damage(values,defaults);

        chd = values.critical_hit_damage || defaults.critical_hit_damage;
        chc = values.critical_hit_chance || defaults.critical_hit_chance;

        return base_damage*(1+chc/100*chd/100);
    }
}
function calculate_dps(values, defaults, mean_damage){
    if (defaults && values){
        if (!mean_damage)
            mean_damage = calculate_mean_damage(values,defaults);

        as = values.attack_speed || defaults.attack_speed;
        aps = values.attacks_per_second || defaults.attacks_per_second;

        return mean_damage*(1+as/100)*(aps);
    }
}

function format_number(number, precision, commas){
	number = Math.round(number*Math.pow(10,precision)/Math.pow(10,precision));
	string_value = number.toString();
	if(precision > 0){
		if(string_value.indexOf(".") < 0)
			string_value += ".0";
		while(string_value.split(".")[1].length < precision){
			string_value += "0";
		}
	}
	if(commas)
		string_value = string_value.split(".")[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (string_value.split(".")[1] ? "."+string_value.split(".")[1] : "");

	return string_value;
}

function get_display_value(val, scale){
    var display_val = String(val/Math.pow(10, scale || 0));

    if(scale > 0){
        if(display_val.indexOf(".") < 0){
            display_val += ".";
        }
        while(display_val.split(".")[1].length < scale){
            display_val += "0";
        }
    }
    return display_val;
}

function get_template(affix, value){
	affix = get_char_affix(affix);
    affix_stuff = _translate[affix] || {};
    var output;
    if (value){
        output = (affix_stuff.template || affix_stuff.display || affix + " {0}").replace("{0}", get_display_value(value, affix_stuff.scale || 0));
    }
    else{
        output = (affix_stuff.display || affix);
    }
    if(affix_stuff.tooltip){
    	output = _translate.tooltip.template.format(output,affix_stuff.tooltip);
    }
    return output;
}

function get_char_affix(affix){
	return _classes[_char.settings.class].translate[affix] || affix;
}

function clear_slot(item_ddl){
    item_ddl.empty();
    item_ddl.append($("<option></option>").html(""));
}
function load_slot(cat, item_ddl, group){
    var slot = item_ddl.parents(".slot").prop("id");

    $.getJSON(_base+"json/"+cat, function(data) {
        if (item_ddl.hasClass("group")){
            parent_item = $("<optgroup></optgroup>").attr("label",cat);
            item_ddl.append(parent_item);
        }
        else{
            parent_item = item_ddl;
        }

        $.each(data.items, function(key, item) {
            item.cat = cat;
            item.base = data.base || cat;
            parent_item.append($("<option></option>").html(key));
        });

        if(_slots[slot])
            $.extend(_slots[slot].items, data.items);
        else
            _slots[slot] = data;

    });
}
function load_ddl(item_ddl){
    clear_slot(item_ddl);
    var slot = item_ddl.parents(".slot").prop("id");

	if( _char.settings.class && _classes[_char.settings.class] &&
		_classes[_char.settings.class].class_specific_slots &&
		_classes[_char.settings.class].class_specific_slots[slot]){
		$.each(_classes[_char.settings.class].class_specific_slots[slot], function(i, item){
			load_slot(item, item_ddl, false);
		});
    }

    $.each(item_ddl.attr("class").split(/\s+/), function(i, cat){
        if($.inArray(cat, _valid_slots) > -1){
            load_slot(cat, item_ddl, false);
        }
    });
    item_ddl.parent().children(".chosen-select").trigger("chosen:updated");
}

function join_item(item){
    if(item && !item.joined){
    	var primary_affixes = _affix.primary[item.base];
        $.each(primary_affixes, function(stat,value){
            if(item.primary)
                item.primary[stat] = value;
        });
        item.socket_value = primary_affixes.socket_value;
        item.joined = true;
    }
}

function item_change(){
    var ddl = $(this);
    var slot = ddl.parents(".slot").prop("id");
    var item_name = ddl.find("option:selected").text();
    var item = _slots[slot].items[item_name];

    join_item(item);

	var affixes = {};
	if (_char[slot] && _char[slot].affixes && _char[slot].affixes.primary){
		affixes = Object.keys(_char[slot].affixes.primary);
	}
    $("#"+slot+" .affix .primary select").empty();
    if(item.primary) {
        $("#"+slot+" .affix .primary select").append($("<option></option>").html(""));
        $.each(item.primary, function(stat,value){
            if(_translate[stat])
                $("#"+slot+" .affix .primary select")
                    .append($("<option></option>").html(get_template(stat)).attr("value", stat).attr("selected", $.inArray(stat, affixes) >=0));
        });
    }
    $("#"+slot+ " .chosen-select").trigger("chosen:updated");
}

function import_begin(){
	$(".import #character_list, .import #import_end").hide().empty();
	$(".import").show();
}
function fetch(){
	var matches = /([a-z]+)[#\-](\d{4})/i.exec($(".import #bid").val());
	if(matches && matches.length == 3){
		var profile_url = _base+"bnet_profile/{0}/{1}/".format(matches[1],matches[2])
		$.getJSON(profile_url, function(data){
			$.each(data.heroes, function(i, hero){
				$("#character_list")
					.append("<option value='{0}'>{1}</option>".format(hero.id,hero.name));
			});
			$(".import #character_list, .import #import_end").show();
		});
	}
}
function import_end(){
	$(".import").hide();
	var matches = /([a-z]+)[#\-](\d{4})/i.exec($(".import #bid").val());
	var hero_id = $("#character_list").val();
	var character_profile_url = _base+"character_profile/{0}/{1}/{2}".format(matches[1],matches[2],hero_id)
	$.getJSON(character_profile_url, function(c_data){
		_char.settings = {};
		_char.settings.class = _bnet_translate[c_data.class];

		$.each(c_data.items, function(slot, item){
			slot = _bnet_translate[slot] || slot;
			var item_name =  _bnet_translate[item.name] || item.name;
			item_blob = _slots[slot].items[item_name];

			_char[slot] = {};
			if(item_blob){
				join_item(item_blob);
				_char[slot].name = item_name;
				_char[slot].affixes = {};
				_char[slot].affixes.primary = {};
				var item_url = _base+"item_details/{0}".format(item.tooltipParams.replace("item/",""));
				$.getJSON(item_url, function(i_data){
					$.each(i_data.attributesRaw, function(key,value){
						var value = (value.min+value.max)/2;
						translate_data = _bnet_translate[key.split("#")[0]] || _bnet_translate[key];
						if(translate_data){
							var scale = translate_data.scale || 0;
							affixes = translate_data.name;
							value = value*Math.pow(10,scale);
							$.each(affixes, function(i, affix){
								if(item_blob.primary[affix]){
									if(!_char[slot].affixes.primary[affix]){
										_char[slot].affixes.primary[affix] = $.extend(true, {},item_blob.primary[affix]);
									}
									scale = _char[slot].affixes.primary[affix].scale || 0;
									value = Math.round(value*Math.pow(10,scale));
									_char[slot].affixes.primary[affix].val =
										(_char[slot].affixes.primary[affix].val || 0) + value
								}
							});
						}
						else{
							debug(["unable to translate",key,JSON.stringify(value)]);
						}
					});
				});
				debug("-----");
			}
		});
		save_to_cookie(_char);
		update_char();
	});
	$(".import").hide();
}

function simplify(statement, values){
	debug(["statement",JSON.stringify(statement)]);
	if(typeof(statement) == typeof({}))
	{
		var keys = Object.keys(statement);
		for(var i = 0; i < keys.length; i++) {
			var key = Object.keys(statement)[i];
			if(values[key]){
				if(statement[key]){
					debug(values[key]);
					values[key] = simplify(statement[key], values);
					debug(values[key]);
				}
			}
			else{
				if (key == "add"){
					var return_value = 0;
					$.each(statement[key], function(i, summand){
						return_value += simplify(summand, values)
					});
					return return_value;
				}
				else if (key == "multiply"){
					var return_value = statement[key].length > 0 ? 1 : 0;
					$.each(statement[key], function(i, summand){
						return_value *= simplify(summand, values)
					});
					return return_value;
				}
			}
		}
	}
	else if(typeof(statement) == typeof(0)){
		return statement;
	}
	else if(typeof(statement) == typeof("")){
		return values[statement]
	}
}

function IsNumeric(input)
{
   return (input - 0) == input && input.length > 0;
}

function createOption(text, value, selected, disabled){
	if (value === undefined) value = null;
	if (selected === undefined) selected = false;
	if (disabled === undefined) disabled = false;

	return $("<option></option>")
				.text(text)
				.attr("value",value)
				.attr("selected",selected)
				.attr("disabled",disabled);
}